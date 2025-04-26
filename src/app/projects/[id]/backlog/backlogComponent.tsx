"use client";

import { useMemo, useState } from "react";
import { redirect } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  type DragEndEvent,
} from "@dnd-kit/core";

import { api } from "~/trpc/react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import ProjectPageShell from "../projectPageShell";
import TaskList from "./tasksList";
import CurrentSprint from "./curentSprint";
import { ALL_SELECT, filterTasks, SortTasksHeader } from "./sortHeader";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_SELECT);
  const [userFilter, setUserFilter] = useState(ALL_SELECT);

  const sensors = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

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

  const filteredTasks = useMemo(
    () => filterTasks(tasks, search, userFilter, statusFilter),
    [tasks, statusFilter, userFilter, search],
  );

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell project={project} userId={userId}>
      <div className="">
        <SortTasksHeader
          users={project.users}
          search={search}
          userFilter={userFilter}
          statusFilter={statusFilter}
          setSearch={setSearch}
          setUserFilter={setUserFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      <DndContext
        onDragEnd={handleDragEnd}
        sensors={[sensors]}
        id="backlog-dnd-context"
      >
        <div className="flex w-full flex-col gap-6 overflow-hidden">
          <div className="overflow-y-auto">
            <CurrentSprint project={project} tasks={filteredTasks} />

            <TaskList
              tasks={filteredTasks}
              projectId={id}
              customTaskTypes={project.customTaskTypes}
            />
          </div>
        </div>
      </DndContext>
    </ProjectPageShell>
  );
};

export default BacklogComponent;
