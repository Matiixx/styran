"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskType } from "@prisma/client";

import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";

import dayjs from "~/utils/dayjs";
import {
  combinedTypeKey,
  getTaskType,
  getTaskTypeIcon,
  splitTypeKey,
  taskTypesOptions,
} from "~/utils/taskUtils";

import { InputWithLabel } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "~/components/ui/select";
import {
  parseFromDateTimePicker,
  parseToDateTimePicker,
} from "../backlog/@task/(.)task/[taskId]/taskDeadline";

const CalendarTaskDialog = ({
  task,
  setOpen,
}: {
  task: TasksRouterOutput["getTasks"][number] | undefined;
  setOpen: (open: boolean) => void;
}) => {
  const utils = api.useUtils();

  const [title, setTitle] = useState(task?.title);
  const [description, setDescription] = useState(task?.description);
  const [startAt, setStartAt] = useState(dayjs(task?.startAt));
  const [doneAt, setDoneAt] = useState(dayjs(task?.doneAt));

  const { mutateAsync: updateTask } = api.tasks.updateTask.useMutation({
    onSuccess: () => {
      setOpen(false);
      return utils.tasks.getTasks.invalidate();
    },
  });

  useEffect(() => {
    if (!task) return;
    setTitle(task?.title);
    setDescription(task?.description);
    setStartAt(dayjs(task?.startAt));
    setDoneAt(dayjs(task?.doneAt));
  }, [task]);

  const handleSubmit = async () => {
    if (!task || !title) return;

    return updateTask({
      taskId: task.id,
      projectId: task.projectId,
      title,
      description: description ?? undefined,
      startAt: startAt?.toDate(),
      doneAt: doneAt?.toDate(),
    });
  };

  return (
    <Dialog open={!!task} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            [{task?.ticker}] {getTaskType(task?.customType ?? task?.type ?? "")}{" "}
            details
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <InputWithLabel
            label="Name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Type your message here."
              className="min-h-24 resize-none p-2"
              value={description ?? ""}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-row gap-2">
            <InputWithLabel
              label="Start Task Date"
              type="datetime-local"
              value={parseToDateTimePicker(startAt)}
              onChange={(e) => {
                setStartAt(parseFromDateTimePicker(e.target.value));
              }}
            />
            <InputWithLabel
              label="Task Deadline"
              type="datetime-local"
              value={parseToDateTimePicker(doneAt)}
              onChange={(e) => {
                setDoneAt(parseFromDateTimePicker(e.target.value));
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CalendarCreateEventDialog = ({
  day,
  projectId,
  customTaskTypes,
  setOpen,
}: {
  day: Date | null;
  projectId: string;
  customTaskTypes: string[];
  setOpen: (open: boolean) => void;
}) => {
  const utils = api.useUtils();
  const { mutateAsync: createTask } = api.tasks.createTask.useMutation({
    onSuccess: () => {
      toast("Event created");
      setOpen(false);
      return Promise.all([
        utils.tasks.getTasks.invalidate({ projectId }),
        utils.tasks.getActivityOverview.invalidate({ projectId }),
        utils.projects.getLastActivity.invalidate({ projectId }),
      ]);
    },
    onError: () => {
      toast.error("Error creating task");
    },
  });

  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(dayjs(day).set("hour", 10));
  const [doneAt, setDoneAt] = useState(dayjs(day).set("hour", 11));
  const [type, setType] = useState<string>(combinedTypeKey(TaskType.TASK, ""));

  useEffect(() => {
    if (!day) return;
    setStartAt(dayjs(day).set("hour", 10));
    setDoneAt(dayjs(day).set("hour", 11));
    setType(combinedTypeKey(TaskType.TASK, ""));
  }, [day]);

  const options = useMemo(
    () => taskTypesOptions(customTaskTypes),
    [customTaskTypes],
  );

  const handleAddEvent = () => {
    if (!title) return;

    return createTask({
      title,
      projectId,
      type: splitTypeKey(type).type,
      customType: splitTypeKey(type).customType,
      startAt: startAt.toDate(),
      doneAt: doneAt.toDate(),
    });
  };

  return (
    <Dialog open={!!day} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create new event</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <InputWithLabel
            label="Name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />

          <div className="flex flex-1 flex-col gap-2">
            <Label>Event type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Task Type</SelectLabel>
                  {map(options, ({ type, customType, value }, key) => (
                    <SelectItem
                      key={key}
                      icon={getTaskTypeIcon(type)}
                      value={value}
                    >
                      {upperFirst(toLower(customType ?? type))}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row gap-2">
            <InputWithLabel
              label="Start Task Date"
              type="datetime-local"
              value={parseToDateTimePicker(startAt)}
              onChange={(e) => {
                setStartAt(parseFromDateTimePicker(e.target.value));
              }}
            />
            <InputWithLabel
              label="Task Deadline"
              type="datetime-local"
              value={parseToDateTimePicker(doneAt)}
              onChange={(e) => {
                setDoneAt(parseFromDateTimePicker(e.target.value));
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAddEvent}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CalendarTaskDialog, CalendarCreateEventDialog };
