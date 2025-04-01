import { useState } from "react";

import { api } from "~/trpc/react";

import dayjs, { type Dayjs } from "~/utils/dayjs";

import { InputWithLabel } from "~/components/ui/input";

type TaskDeadlineProps = {
  taskId: string;
  startAt: Date | null;
  endAt: Date | null;
  projectId: string;
};

const TaskDeadline = ({
  taskId,
  startAt,
  endAt,
  projectId,
}: TaskDeadlineProps) => {
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs(startAt));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs(endAt));

  const utils = api.useUtils();
  const { mutateAsync: updateTask, isPending } =
    api.tasks.updateTask.useMutation({
      onSuccess: () => {
        return utils.tasks.getTask.invalidate({ taskId });
      },
    });

  const parseToDateTimePicker = (date: Dayjs | null) => {
    if (!date) return "";
    return date.format("YYYY-MM-DDTHH:mm");
  };

  const parseFromDateTimePicker = (date: string) => {
    return dayjs(date);
  };

  const handleChange = (time: string, mode: "start" | "end") => {
    const parsedTime = parseFromDateTimePicker(time);

    if (mode === "start") {
      if (endTime?.isBefore(parsedTime)) {
        setEndTime(parsedTime);
      }
      setStartTime(parsedTime);
    } else {
      if (startTime?.isAfter(parsedTime)) {
        setStartTime(parsedTime);
      }
      setEndTime(parsedTime);
    }
  };

  const handleBlur = () => {
    return updateTask({
      taskId,
      projectId,
      doneAt: endTime ? endTime.toDate() : null,
      startAt: startTime ? startTime.toDate() : null,
    });
  };

  return (
    <div className="flex flex-row gap-2">
      <InputWithLabel
        label="Start Task Date"
        type="datetime-local"
        disabled={isPending}
        defaultValue={parseToDateTimePicker(startTime)}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.value, "start")}
      />
      <InputWithLabel
        label="Task Deadline"
        type="datetime-local"
        disabled={isPending}
        defaultValue={parseToDateTimePicker(endTime)}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.value, "end")}
      />
    </div>
  );
};

export { TaskDeadline };
