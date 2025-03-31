import React from "react";

import { $Enums, type TaskPriority } from "@prisma/client";

import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleSlash,
} from "lucide-react";
import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";
import { getColorByPriority } from "~/utils/taskUtils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";

type TaskPrioritySelectProps = {
  taskId: string;
  projectId: string;
  taskPriority: TaskPriority;
};

export const TaskPrioritySelect = ({
  taskId,
  projectId,
  taskPriority,
}: TaskPrioritySelectProps) => {
  const utils = api.useUtils();
  const { mutateAsync: updateTask, isPending } =
    api.tasks.updateTask.useMutation({
      onSuccess: () =>
        Promise.all([
          utils.tasks.getTasks.invalidate({ projectId }),
          utils.tasks.getTask.invalidate({ taskId, projectId }),
        ]),
    });

  const onPriorityChange = (priority: TaskPriority) => {
    return updateTask({
      taskId,
      projectId,
      priority,
    });
  };

  return (
    <Select
      value={taskPriority}
      disabled={isPending}
      onValueChange={onPriorityChange}
    >
      <SelectTrigger size={"default"} className={cn("w-fit")}>
        <div className="flex items-center gap-2">
          {PriorityIcon[taskPriority]}
          {upperFirst(toLower(taskPriority))}
        </div>
      </SelectTrigger>

      <SelectContent>
        {map($Enums.TaskPriority, (priority, key) => (
          <SelectItem key={key} value={priority}>
            <div className="flex items-center gap-2">
              {PriorityIcon[priority]}
              {upperFirst(toLower(priority))}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const iconSize = "h-5 w-5";
const PriorityIcon: Record<TaskPriority, React.ReactNode> = {
  NONE: (
    <CircleSlash
      className={cn(iconSize, getColorByPriority("NONE").foreground)}
    />
  ),
  LOW: (
    <ChevronDown
      className={cn(iconSize, getColorByPriority("LOW").foreground)}
    />
  ),
  MEDIUM: (
    <ChevronRight
      className={cn(iconSize, getColorByPriority("MEDIUM").foreground)}
    />
  ),
  HIGH: (
    <ChevronUp
      className={cn(iconSize, getColorByPriority("HIGH").foreground)}
    />
  ),
};
