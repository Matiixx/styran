import { useMemo } from "react";

import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";

type Task = NonNullable<TasksRouterOutput["getTask"]>;
type AssingeeUser = NonNullable<
  ProjectRouterOutput["getProject"]
>["users"][number];

type AsigneeSelectProps = {
  task: Task;
};

export default function AsigneeSelect({ task }: AsigneeSelectProps) {
  const [project] = api.projects.getProject.useSuspenseQuery({
    id: task.projectId,
  });

  const options = useMemo(
    () => getAssigneeOptions(project?.users),
    [project?.users],
  );

  return (
    <div className="flex w-full flex-row items-center gap-4">
      Asignee
      <Select>
        <SelectTrigger>
          <span className="capitalize">Unassigned</span>
        </SelectTrigger>

        <SelectContent>
          {map(options, (opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const getAssigneeOptions = (users: AssingeeUser[] | undefined) => {
  return [
    {
      label: "Unassigned",
      value: "unassigned",
    },
    ...map(users, (u) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: u.id,
    })),
  ];
};
