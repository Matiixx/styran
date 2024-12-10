"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  type DragEndEvent,
} from "@dnd-kit/core";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import ProjectPageShell from "../projectPageShell";
import TaskList from "./tasksList";
import CurrentSprint from "./curentSprint";

type BacklogComponentProps = {
  id: string;
  userId: string;
};
type Task = TasksRouterOutput["getTasks"][number];

const BacklogComponent = ({ id, userId }: BacklogComponentProps) => {
  const utils = api.useUtils();
  const [project] = api.projects.getProject.useSuspenseQuery({ id });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId: id });
  const { mutateAsync: updateTask } = api.tasks.moveTask.useMutation({
    onSuccess: () => {
      return utils.tasks.getTasks.invalidate({ projectId: id });
    },
  });

  const sensors = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

  if (!project) {
    redirect("/projects");
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const task = event.active?.data.current?.task as Task;
    const target = event.over?.id;

    if (
      !task ||
      !target ||
      (target === "currentSprint" && !!task.sprintId) ||
      (target !== "currentSprint" && !task.sprintId)
    )
      return;

    return updateTask({
      projectId: id,
      taskId: task.id,
      sprint: target === "currentSprint",
    });
  };

  return (
    <ProjectPageShell project={project} userId={userId}>
      <div className="flex flex-row gap-4">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost">Main</Button>
        </Link>

        <Button variant="default">Backlog</Button>

        <Link href={`/projects/${id}/board`}>
          <Button variant="ghost">Board</Button>
        </Link>

        <Link href={`/projects/${id}/users`}>
          <Button variant="ghost">Users</Button>
        </Link>
      </div>

      <DndContext
        onDragEnd={handleDragEnd}
        sensors={[sensors]}
        id="backlog-dnd-context"
      >
        <div className="mx-4 my-8 flex w-full flex-col gap-6 overflow-hidden">
          <div className="overflow-y-auto">
            <CurrentSprint project={project} tasks={tasks} />

            <TaskList tasks={tasks} projectId={id} />
          </div>
        </div>
      </DndContext>
    </ProjectPageShell>
  );
};

export default BacklogComponent;
