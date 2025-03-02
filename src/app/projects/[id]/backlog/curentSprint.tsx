import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "@prisma/client";

import filter from "lodash/filter";
import groupBy from "lodash/groupBy";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { statusColor, TaskCard } from "./tasksList";
import { StartSprintModal } from "./startSprintDialog";
import { EndSprintModal } from "./endSprintDialog";
import { Badge } from "~/components/ui/badge";

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
  const { setNodeRef, isOver } = useDroppable({ id: "currentSprint" });

  const [open, setOpen] = useState<DialogType | null>(null);

  const isSprintActive = !isEmpty(project.sprint);

  const sprintPoints = useMemo(
    () => calculateSprintStoryPoints(tasks),
    [tasks],
  );

  return (
    <div
      className={cn("bg-white/20", isOver ? "bg-white/40" : "")}
      ref={setNodeRef}
    >
      <div
        className={cn(
          "my-2 flex flex-row items-center gap-4",
          isSprintActive ? "justify-between" : "justify-end",
        )}
      >
        {isSprintActive ? (
          <>
            <div>
              <span className="text-lg font-semibold">
                {project.sprint?.[0]?.name}
              </span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Badge
                className={cn(
                  statusColor[TaskStatus.DONE],
                  "text-black",
                  `hover:${statusColor[TaskStatus.DONE]}`,
                )}
              >
                {sprintPoints.DONE}
              </Badge>
              <Badge
                className={cn(
                  statusColor[TaskStatus.IN_PROGRESS],
                  "text-black",
                  `hover:${statusColor[TaskStatus.IN_PROGRESS]}`,
                )}
              >
                {sprintPoints.IN_PROGRESS}
              </Badge>
              <Badge
                className={cn(
                  statusColor[TaskStatus.TODO],
                  "text-black",
                  `hover:${statusColor[TaskStatus.TODO]}`,
                )}
              >
                {sprintPoints.TODO}
              </Badge>
              <Button
                variant="secondary"
                onClick={() => setOpen(DialogType.END)}
              >
                End sprint
              </Button>
            </div>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(DialogType.START)}>
            Start new sprint
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
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

const calculateSprintStoryPoints = (tasks: Task[]) => {
  const groupedTasks = groupBy(tasks, (t) => t.status) as Record<
    Task["status"],
    Task[]
  >;

  const sumPoints = (tasks: Task[]) =>
    tasks.reduce((acc, task) => acc + (task.storyPoints ?? 0), 0);

  return {
    TODO: sumPoints(groupedTasks.TODO ?? []),
    IN_PROGRESS:
      sumPoints(groupedTasks.IN_PROGRESS ?? []) +
      sumPoints(groupedTasks.IN_REVIEW ?? []),
    DONE: sumPoints(groupedTasks.DONE ?? []),
  } as const;
};
