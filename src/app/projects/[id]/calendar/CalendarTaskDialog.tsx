"use client";

import { useEffect, useState } from "react";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";

import dayjs from "~/utils/dayjs";
import { getTaskType } from "~/utils/taskUtils";

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
  setOpen,
}: {
  day: Date | null;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={!!day} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {/* [{task?.ticker}] {getTaskType(task?.customType ?? task?.type ?? "")}{" "} */}
            details
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <InputWithLabel
            label="Name"
            // value={title}
            // onChange={(e) => {
            //   setTitle(e.target.value);
            // }}
          />

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Type your message here."
              className="min-h-24 resize-none p-2"
              // value={description ?? ""}
              // onChange={(e) => {
              //   setDescription(e.target.value);
              // }}
            />
          </div>

          <div className="flex flex-row gap-2">
            <InputWithLabel
              label="Start Task Date"
              type="datetime-local"
              // value={parseToDateTimePicker(startAt)}
              // onChange={(e) => {
              //   setStartAt(parseFromDateTimePicker(e.target.value));
              // }}
            />
            <InputWithLabel
              label="Task Deadline"
              type="datetime-local"
              // value={parseToDateTimePicker(doneAt)}
              // onChange={(e) => {
              //   setDoneAt(parseFromDateTimePicker(e.target.value));
              // }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => 1}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CalendarTaskDialog, CalendarCreateEventDialog };
