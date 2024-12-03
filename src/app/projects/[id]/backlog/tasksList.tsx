import { TaskStatus, TaskType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";
import Link from "next/link";

import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";

import { Bookmark, Bug, Lightbulb, Plus, Vote } from "lucide-react";

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
import filter from "lodash/filter";

type TaskListProps = {
  userId: string;
  projectId: string;
};

type Task = TasksRouterOutput["getTasks"][number];

const TaskList = ({ projectId }: TaskListProps) => {
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  return (
    <div className="mx-4 my-8 flex w-full flex-col gap-6 overflow-hidden">
      <div className="flex flex-col gap-4 overflow-y-auto">
        {map(
          filter(tasks, (task) => !task.sprintId),
          (task) => (
            <TaskCard key={task.id} task={task} />
          ),
        )}
        <AddNewTaskCard projectId={projectId} />
      </div>
    </div>
  );
};

const TaskTypeIcon: Record<TaskType, React.ReactNode> = {
  BUG: <Bug className="text-red-500" />,
  FEATURE: <Lightbulb className="text-yellow-500" />,
  STORY: <Bookmark className="text-green-500" />,
  TASK: <Vote className="text-blue-500" />,
};

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <Link href={`/projects/${task.projectId}/backlog/task/${task.id}`}>
      <Card className="cursor-pointer">
        <CardContent className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            {TaskTypeIcon[task.type]}
            <Badge
              variant="outline"
              className={task.status === TaskStatus.DONE ? "line-through" : ""}
            >
              {task.ticker}
            </Badge>
            <p
              className={task.status === TaskStatus.DONE ? "line-through" : ""}
            >
              {task.title}
            </p>
          </div>
          <div>
            <TaskStatusSelect task={task} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const statusColor: Record<TaskStatus, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-400",
  IN_REVIEW: "bg-blue-400",
  DONE: "bg-green-400",
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
      onValueChange={onStatusChange}
      disabled={isPending}
    >
      <SelectTrigger size={size} className={statusColor[task.status]}>
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

const AddNewTaskCard = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  const { mutateAsync: createTask } = api.tasks.createTask.useMutation({
    onSuccess: () => {
      return utils.tasks.getTasks.invalidate({ projectId });
    },
  });

  const { control, register, handleSubmit, reset } = useForm<
    z.infer<typeof NewTaskSchema>
  >({
    mode: "onChange",
    defaultValues: { type: TaskType.TASK },
    resolver: zodResolver(NewTaskSchema),
  });

  const onSubmit = handleSubmit((data) => {
    return createTask({ ...data, projectId }).then(() => reset());
  });

  return (
    <Card size="compact">
      <CardContent>
        <form className="flex flex-row items-center gap-2" onSubmit={onSubmit}>
          <Input placeholder="Add new task" {...register("title")} />

          <Controller
            name="type"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="max-w-[200px]">
                  <SelectValue placeholder="Select a task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Task Type</SelectLabel>
                    {map(TaskType, (type, key) => (
                      <SelectItem
                        icon={TaskTypeIcon[type]}
                        key={key}
                        value={type}
                      >
                        {upperFirst(toLower(type))}
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
