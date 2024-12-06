import { useState } from "react";

import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { Button } from "~/components/ui/button";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { TaskCard } from "./tasksList";
import { StartSprintModal } from "./startSprintDialog";
import { EndSprintModal } from "./endSprintDialog";

type Project = NonNullable<ProjectRouterOutput["getProject"]>;
type Task = TasksRouterOutput["getTasks"][number];

enum DialogType {
  START = "START",
  END = "END",
}

export default function CurrentSprint({
  tasks,
  project,
}: {
  tasks: Task[];
  project: Project;
}) {
  const [open, setOpen] = useState<DialogType | null>(null);

  const isSprintActive = !isEmpty(project.sprint);

  return (
    <div className="bg-white/20">
      <div className="my-2 flex flex-row items-center justify-between gap-4">
        {isSprintActive ? (
          <>
            <div>
              <span className="text-lg font-semibold">
                {project.sprint?.[0]?.name}
              </span>
            </div>
            <Button variant="secondary" onClick={() => setOpen(DialogType.END)}>
              End sprint
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(DialogType.START)}>
            Start new sprint
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {map(
          filter(tasks, (t) => !!t.sprintId),
          (task) => (
            <TaskCard key={task.id} task={task} />
          ),
        )}
      </div>

      <StartSprintModal
        isOpen={open === DialogType.START}
        projectId={project.id}
        closeDialog={() => setOpen(null)}
      />

      <EndSprintModal
        isOpen={open === DialogType.END}
        sprintId={project.sprint?.[0]?.id ?? ""}
        projectId={project.id}
        closeDialog={() => setOpen(null)}
      />
    </div>
  );
}
