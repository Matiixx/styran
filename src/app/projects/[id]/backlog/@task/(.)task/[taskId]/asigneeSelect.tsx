import { useMemo } from "react";

import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";
import { UNASSIGNED_USER_ID } from "~/lib/schemas/taskSchemas";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

type Task = NonNullable<TasksRouterOutput["getTask"]>;
type AssingeeUser = NonNullable<
  ProjectRouterOutput["getProject"]
>["users"][number];

type AsigneeSelectProps = {
  task: Task;
  isUpdating: boolean;
  updateTask: (assigneeId: string) => Promise<void>;
};

export default function AsigneeSelect({
  task,
  isUpdating,
  updateTask,
}: AsigneeSelectProps) {
  const [project] = api.projects.getProject.useSuspenseQuery({
    id: task.projectId,
  });

  const options = useMemo(
    () => getAssigneeOptions(project?.users),
    [project?.users],
  );

  const handleChange = (value: string) => {
    return updateTask(value === UNASSIGNED_VALUE ? UNASSIGNED_USER_ID : value);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <Label>Asignee</Label>
      <Select disabled={isUpdating} onValueChange={handleChange}>
        <SelectTrigger>
          <span className="capitalize">
            {task.asignee
              ? `${task.asignee?.firstName} ${task.asignee?.lastName}`
              : "Unassigned"}
          </span>
        </SelectTrigger>

        <SelectContent>
          {map(options, (opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const UNASSIGNED_VALUE = "unassigned";

const getAssigneeOptions = (users: AssingeeUser[] | undefined) => {
  return [
    {
      label: "Unassigned",
      value: UNASSIGNED_VALUE,
    },
    ...map(users, (u) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: u.id,
    })),
  ];
};
