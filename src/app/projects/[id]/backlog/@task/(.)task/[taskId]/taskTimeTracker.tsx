import { useCallback, useState } from "react";

import { formatDuration, intervalToDuration } from "date-fns";
import dayjs from "dayjs";

import noop from "lodash/noop";

import { Play, Plus } from "lucide-react";

import { api } from "~/trpc/react";
import { type TimeTrackerRouterOutput } from "~/server/api/routers/timeTracker";

import { InputWithLabel } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

type TaskCommentsProps = {
  taskId: string;
  trackTimes: TimeTrack[];
};

export type TimeTrack = TimeTrackerRouterOutput["getTimes"][number];

export default function TaskTimeTracker({
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

  const { mutateAsync: saveTimeTrack } = api.timeTracker.addTime.useMutation({
    onSuccess,
  });

  const parseFromTimePicker = (time: string | undefined) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":");
    return dayjs().hour(parseInt(hours!)).minute(parseInt(minutes!));
  };

  const parseToTimePicker = (time: dayjs.Dayjs | null) => {
    if (!time) return "";
    return time.format("HH:mm");
  };

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
    }).then(noop);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="mb-2 text-sm font-medium">
        Time Tracking
        {duration && (
          <Badge variant="secondary" className="ml-2">
            {formatDuration(
              intervalToDuration({
                start: 0,
                end: duration * 60 * 1000,
              }),
              { format: ["hours", "minutes"] },
            )}
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
        <Button variant="outline" className="flex-1">
          <Play />
          Start
        </Button>

        <Button variant="outline" onClick={() => handleAddTime(1)}>
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

      <div className="flex flex-col gap-2">
        {trackTimes.map((time) => (
          <div key={time.id}>{time.startTime.toISOString()}</div>
        ))}
      </div>
    </div>
  );
}
