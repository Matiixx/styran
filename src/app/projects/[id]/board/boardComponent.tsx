"use client";

import { useMemo } from "react";
import { TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

import groupBy from "lodash/groupBy";
import map from "lodash/map";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import ProjectPageShell from "../projectPageShell";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "~/lib/utils";

type BoardComponentProps = {
  userId: string;
  projectId: string;
};

export default function BoardComponent({
  userId,
  projectId,
}: BoardComponentProps) {
  const utils = api.useUtils();
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  const { mutateAsync: updateTask } = api.tasks.updateTask.useMutation({
    onSuccess: () => {
      return utils.tasks.getTasks.invalidate({ projectId });
    },
  });

  if (!project) {
    redirect("/projects");
  }

  const groupedTasks = useMemo(() => {
    return groupBy(tasks, (t) => t.status);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const taskItem = event.active.data.current?.task as Tasks[number];
    const newStatus = event.over?.id as TaskStatus;

    if (taskItem.status === newStatus) {
      return;
    }

    return updateTask({
      taskId: taskItem.id,
      status: newStatus,
      projectId,
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ProjectPageShell project={project} userId={userId}>
        <div className="mt-4 w-full flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-row justify-between gap-4">
            {map(TaskStatus, (status) => (
              <BoardColumn
                key={status}
                tasks={groupedTasks[status] ?? []}
                status={status}
              />
            ))}
          </div>
        </div>
      </ProjectPageShell>
    </DndContext>
  );
}

type Tasks = TasksRouterOutput["getTasks"];

type BoardColumnProps = {
  tasks: Tasks;
  status: TaskStatus;
};

const BoardColumn = ({ tasks, status }: BoardColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      className={cn(
        "flex flex-1 select-none flex-col border border-black bg-black/20 shadow",
        isOver ? "border-green-500" : "",
      )}
      ref={setNodeRef}
    >
      <div className="border-b border-black bg-white/10 p-2 font-bold">
        {status.replace("_", " ")}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {map(tasks, (t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
};

type TaskCardProps = {
  task: Tasks[number];
};

const TaskCard = ({ task }: TaskCardProps) => {
  const { attributes, listeners, transform, setNodeRef } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      className="flex cursor-move flex-col border border-black/50 bg-white/10 p-2 text-white will-change-transform hover:text-black"
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-sm", task.status === "DONE" && "line-through")}
        >
          {task.ticker}
        </div>
      </CardContent>
    </Card>
  );
};
