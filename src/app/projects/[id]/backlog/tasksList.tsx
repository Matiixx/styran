"use client";

import { useMemo, useCallback } from "react";
import { TaskStatus, TaskType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";
import { redirect } from "next/navigation";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";

import filter from "lodash/filter";
import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";
import values from "lodash/values";

import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { NewTaskSchema } from "~/lib/schemas/taskSchemas";
import { api } from "~/trpc/react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { UserAvatar } from "~/app/_components/UserAvatar";
import { getColorByStatus, getTaskTypeIcon } from "~/utils/taskUtils";

type Task = TasksRouterOutput["getTasks"][number];
type TaskListProps = {
  tasks: Task[];
  projectId: string;
  customTaskTypes: string[];
};

const TaskList = ({ tasks, projectId, customTaskTypes }: TaskListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "backlog" });

  return (
    <div
      className={cn("mt-8 transition-all", isOver && "bg-black/20")}
      ref={setNodeRef}
    >
      <span className="text-lg font-semibold">Backlog</span>
      <div className="flex flex-col gap-2">
        {map(
          filter(tasks, (t) => !t.sprintId),
          (task) => (
            <TaskCard key={task.id} task={task} />
          ),
        )}
        <AddNewTaskCard
          projectId={projectId}
          customTaskTypes={customTaskTypes}
        />
      </div>
    </div>
  );
};

export const TaskCard = ({ task }: { task: Task }) => {
  const { attributes, listeners, transform, setNodeRef } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(0, ${transform.y}px, 0)` }
    : undefined;

  const handleClick = () => {
    redirect(`/projects/${task.projectId}/backlog/task/${task.id}`);
  };

  return (
    <Card
      className="cursor-pointer p-4"
      style={style}
      ref={setNodeRef}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          {getTaskTypeIcon(task.type)}
          <Badge
            variant="outline"
            className={task.status === TaskStatus.DONE ? "line-through" : ""}
          >
            {task.ticker}
          </Badge>
          <p className={task.status === TaskStatus.DONE ? "line-through" : ""}>
            {task.title}
          </p>
        </div>

        <div className="flex flex-row items-center gap-2">
          {task.asigneeId && <UserAvatar user={task.asignee} size="sm" />}
          {task.storyPoints !== null && (
            <Badge variant="outline">{task.storyPoints}</Badge>
          )}
          <TaskStatusSelect task={task} />
        </div>
      </CardContent>
    </Card>
  );
};

export const TaskStatusSelect = ({
  task,
  size = "sm",
}: {
  task: Task;
  size?: "sm" | "default";
}) => {
  const utils = api.useUtils();
  const { mutateAsync: updateTaskStatus, isPending } =
    api.tasks.updateTask.useMutation({
      onSuccess: () =>
        Promise.all([
          utils.tasks.getTasks.invalidate({ projectId: task.projectId }),
          utils.tasks.getTask.invalidate({
            taskId: task.id,
            projectId: task.projectId,
          }),
        ]),
    });

  const onStatusChange = (status: TaskStatus) => {
    return updateTaskStatus({
      status,
      taskId: task.id,
      projectId: task.projectId,
    });
  };

  return (
    <Select
      value={task.status}
      disabled={isPending}
      onValueChange={onStatusChange}
    >
      <SelectTrigger
        size={size}
        className={cn(getColorByStatus(task.status), "w-fit")}
      >
        <span className="capitalize">{task.status}</span>
      </SelectTrigger>

      <SelectContent>
        {map(TaskStatus, (status, key) => (
          <SelectItem key={key} value={status}>
            {status.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const AddNewTaskCard = ({
  projectId,
  customTaskTypes,
}: {
  projectId: string;
  customTaskTypes: string[];
}) => {
  const utils = api.useUtils();
  const { mutateAsync: createTask } = api.tasks.createTask.useMutation({
    onSuccess: () => {
      toast("Task created");
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

  const { control, register, handleSubmit, reset, setValue, watch } = useForm<
    z.infer<typeof NewTaskSchema>
  >({
    mode: "onChange",
    defaultValues: { type: TaskType.TASK },
    resolver: zodResolver(NewTaskSchema),
  });

  const customType = watch("customType");
  const type = watch("type");

  const combinedTypeValue = useMemo(
    () => `${type}_${customType || ""}`,
    [type, customType],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const [typeValue, customTypeValue] = value.split("_");
      setValue("type", typeValue as TaskType);
      setValue("customType", customTypeValue || undefined);
    },
    [setValue],
  );

  const onSubmit = handleSubmit((data) => {
    return createTask({ ...data, projectId }).then(() => reset());
  });

  const options: Array<{ type: TaskType; customType?: string; value: string }> =
    useMemo(() => {
      return [
        ...values(TaskType)
          .filter((type) => type !== TaskType.CUSTOM)
          .map((type) => ({ type: type as TaskType, value: `${type}_` })),
        ...customTaskTypes.map((customType) => ({
          type: TaskType.CUSTOM,
          customType,
          value: `${TaskType.CUSTOM}_${customType}`,
        })),
      ];
    }, [customTaskTypes]);

  return (
    <Card size="compact">
      <CardContent>
        <form className="flex flex-row items-center gap-2" onSubmit={onSubmit}>
          <Input placeholder="Add new task" {...register("title")} />

          <Controller
            name="type"
            control={control}
            render={() => (
              <Select
                value={combinedTypeValue}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="max-w-[200px]">
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
            )}
          />

          <Button variant="default" onClick={onSubmit}>
            <Plus />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskList;
