import { useCallback, useMemo, useState } from "react";

import { format, formatDuration, intervalToDuration } from "date-fns";
import dayjs from "dayjs";

import filter from "lodash/filter";
import noop from "lodash/noop";

import { Check, Edit, Ellipsis, Play, Plus, Trash, X } from "lucide-react";

import { api } from "~/trpc/react";
import { type TimeTrackerRouterOutput } from "~/server/api/routers/timeTracker";

import { Input, InputWithLabel } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { UserAvatar } from "~/app/_components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";

type TaskCommentsProps = {
  userId: string;
  taskId: string;
  trackTimes: TimeTrack[];
};

export type TimeTrack = TimeTrackerRouterOutput["getTimes"][number];

export default function TaskTimeTracker({
  userId,
  taskId,
  trackTimes,
}: TaskCommentsProps) {
  const utils = api.useUtils();
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);

  const onSuccess = useCallback(
    () =>
      Promise.all([
        utils.timeTracker.getTimes.invalidate({ taskId }),
        utils.tasks.getTask.invalidate({ taskId }),
      ]),
    [utils, taskId],
  );

  const { mutateAsync: saveTimeTrack, isPending: isSaving } =
    api.timeTracker.addTime.useMutation({
      onSuccess,
    });

  const handleChange = (time: string, mode: "start" | "end") => {
    if (mode === "start") {
      if (endTime?.isBefore(parseFromTimePicker(time))) {
        setEndTime(parseFromTimePicker(time));
      }
      setStartTime(parseFromTimePicker(time));
    } else {
      if (startTime?.isAfter(parseFromTimePicker(time))) {
        setStartTime(parseFromTimePicker(time));
      }
      setEndTime(parseFromTimePicker(time));
    }
  };

  const handleAddTime = (amount: number) => {
    let newTime = endTime;
    if (!endTime) {
      if (!startTime) {
        newTime = dayjs().add(amount, "hours");
        setStartTime(dayjs());
      } else {
        newTime = startTime.add(amount, "hours");
      }
    } else {
      newTime = endTime.add(amount, "hours");
    }
    if (newTime.isAfter(dayjs().endOf("day").subtract(amount, "hour"))) {
      newTime = dayjs().endOf("day");
    }
    setEndTime(newTime);
  };

  const duration = endTime?.diff(startTime, "minutes");

  const handleSave = () => {
    if (!startTime || !endTime) return;

    return saveTimeTrack({
      taskId,
      startTime: startTime.toDate(),
      endTime: endTime.toDate(),
    }).then(() => {
      setStartTime(null);
      setEndTime(null);
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="mb-2 text-sm font-medium">
        Time Tracking
        {duration && (
          <Badge variant="secondary" className="ml-2">
            {milisToFormatedDuration(duration * 60 * 1000)}
          </Badge>
        )}
      </span>

      <div className="flex w-full flex-row gap-2">
        <InputWithLabel
          label="Start Time"
          type="time"
          value={parseToTimePicker(startTime)}
          onChange={(e) => handleChange(e.target.value, "start")}
        />
        <InputWithLabel
          label="End Time"
          type="time"
          value={parseToTimePicker(endTime)}
          onChange={(e) => handleChange(e.target.value, "end")}
        />
      </div>

      <div className="flex w-full flex-row gap-2">
        <Button variant="outline" className="flex-1" disabled={isSaving}>
          <Play />
          Start
        </Button>

        <Button
          variant="outline"
          disabled={isSaving}
          onClick={() => handleAddTime(1)}
        >
          <Plus />
          1h
        </Button>

        <Button
          disabled={!startTime || !endTime}
          className="flex-1"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>

      <RecentTimeEntries
        userId={userId}
        taskId={taskId}
        trackTimes={trackTimes}
      />
    </div>
  );
}

const RecentTimeEntries = ({
  userId,
  taskId,
  trackTimes,
}: {
  userId: string;
  taskId: string;
  trackTimes: TimeTrack[];
}) => {
  const [editingId, setEditingId] = useState<string>("");

  const utils = api.useUtils();
  const { mutateAsync: deleteTime } = api.timeTracker.deleteTime.useMutation({
    onSuccess: () => {
      return utils.timeTracker.getTimes.invalidate({ taskId });
    },
  });

  const { mutateAsync: updateTime } = api.timeTracker.updateTime.useMutation({
    onSuccess: () => {
      return utils.timeTracker.getTimes.invalidate({ taskId });
    },
  });

  const handleSave = useCallback(
    (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => {
      return updateTime({
        timeId: editingId,
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
      })
        .then(() => setEditingId(""))
        .then(noop);
    },
    [editingId, updateTime],
  );

  const filteredEntries = useMemo(() => {
    return filter(trackTimes, (entry) => {
      return !!entry.endTime;
    });
  }, [trackTimes]);

  const durationSum = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => {
      if (!curr.endTime) return acc;

      return acc + (curr.endTime.getTime() - curr.startTime.getTime());
    }, 0);
  }, [filteredEntries]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="recent-entries">
        <AccordionTrigger className="py-2 text-sm">
          <div>
            Recent Time Entries
            {!!durationSum && (
              <Badge variant="secondary" className="ml-2">
                {milisToFormatedDuration(durationSum)}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {filteredEntries.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No entries yet
            </p>
          ) : (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {filteredEntries.map((entry) => {
                if (entry.id === editingId) {
                  return (
                    <TimeEntryEdit
                      key={entry.id}
                      entry={entry}
                      onSave={handleSave}
                      onCancel={() => setEditingId("")}
                    />
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border-b pb-2 text-xs"
                  >
                    <div className="w-full">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={entry.user} size="sm" />
                          <span className="font-medium">{`${entry.user.firstName} ${entry.user.lastName}`}</span>
                        </div>
                        {entry.userId === userId && (
                          <TimeEntryDropdown
                            onEdit={() => setEditingId(entry.id)}
                            onDelete={() =>
                              deleteTime({ timeId: entry.id }).then(noop)
                            }
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between pl-7">
                        <div>
                          {entry.startTime &&
                            format(entry.startTime, "MMM d, h:mm a")}
                          {entry.endTime &&
                            ` - ${format(entry.endTime, "h:mm a")}`}{" "}
                          <Badge variant="secondary">
                            {milisToFormatedDuration(
                              entry.endTime!.getTime() -
                                entry.startTime.getTime(),
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const TimeEntryEdit = ({
  entry,
  onSave,
  onCancel,
}: {
  entry: TimeTrack;
  onSave: (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => Promise<void>;
  onCancel: () => void;
}) => {
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(
    dayjs(entry.startTime),
  );
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(
    dayjs(entry.endTime),
  );

  const handleTimeChange = (time: string, mode: "start" | "end") => {
    const [hours, minutes] = time.split(":");
    const newTime = dayjs(entry.startTime)
      .hour(parseInt(hours!))
      .minute(parseInt(minutes!));
    if (mode === "start") {
      setStartTime(newTime);
    } else {
      setEndTime(newTime);
    }
  };
  return (
    <div className="border-b bg-gray-50 px-1 pr-1">
      <div className="flex w-full flex-row gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs">Start</Label>
          <Input
            type="time"
            value={parseToTimePicker(startTime)}
            className="h-6 rounded-none !text-xs"
            onChange={(e) => handleTimeChange(e.target.value, "start")}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label className="text-xs">End</Label>
          <Input
            type="time"
            value={parseToTimePicker(endTime)}
            className="h-6 rounded-none !text-xs"
            onChange={(e) => setEndTime(parseFromTimePicker(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-2 flex w-full justify-end gap-1">
        <Button size="iconSm" variant="ghost" onClick={onCancel}>
          <X />
        </Button>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            if (!startTime || !endTime) return;
            return onSave(startTime, endTime);
          }}
        >
          <Check />
        </Button>
      </div>
    </div>
  );
};

const TimeEntryDropdown = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);

  const handleDeleteClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    return onDelete().finally(() => setOpen(false));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="iconSm">
          <Ellipsis size={8} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit size={8} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDeleteClick}
        >
          <Trash size={8} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const milisToFormatedDuration = (milis: number) => {
  return formatDuration(intervalToDuration({ start: 0, end: milis }), {
    format: ["hours", "minutes"],
  });
};

const parseToTimePicker = (time: dayjs.Dayjs | null) => {
  if (!time) return "";
  return time.format("HH:mm");
};

const parseFromTimePicker = (time: string | undefined) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":");
  return dayjs().hour(parseInt(hours!)).minute(parseInt(minutes!));
};
