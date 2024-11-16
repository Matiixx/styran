import { TaskType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";

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

type TaskListProps = {
  userId: string;
  projectId: string;
};

const TaskList = ({ projectId }: TaskListProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <AddNewTaskCard projectId={projectId} />
    </div>
  );
};

const TaskTypeIcon: Record<TaskType, React.ReactNode> = {
  BUG: <Bug className="text-red-500" />,
  FEATURE: <Lightbulb className="text-yellow-500" />,
  STORY: <Bookmark className="text-green-500" />,
  TASK: <Vote className="text-blue-500" />,
};

const AddNewTaskCard = ({ projectId }: { projectId: string }) => {
  const { mutateAsync: createTask } = api.tasks.createTask.useMutation({
    onSuccess: () => {
      return;
    },
  });

  const { control, register, handleSubmit } = useForm<
    z.infer<typeof NewTaskSchema>
  >({
    mode: "onChange",
    defaultValues: { type: TaskType.TASK },
    resolver: zodResolver(NewTaskSchema),
  });

  const onSubmit = handleSubmit((data) => {
    return createTask({ ...data, projectId });
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
