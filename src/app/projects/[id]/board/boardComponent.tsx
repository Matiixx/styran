"use client";

import { useMemo, useState } from "react";
import { TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import groupBy from "lodash/groupBy";
import map from "lodash/map";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";
import { UserAvatar } from "~/app/_components/UserAvatar";

import ProjectPageShell from "../projectPageShell";
import {
  ALL_SELECT,
  filterTasks,
  SortTasksHeader,
} from "../backlog/sortHeader";

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

  const [tempTasks, setTempTasks] = useState<Tasks>(tasks);
  const [disabledTasks, setDisabledTasks] = useState<string[]>([]);

  const { mutateAsync: updateTask } = api.tasks.updateTask.useMutation({
    onSuccess: () => utils.tasks.getTasks.invalidate({ projectId }),
  });

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState(ALL_SELECT);

  if (!project) {
    redirect("/projects");
  }

  const filteredTasks = useMemo(
    () => filterTasks(tempTasks, search, userFilter),
    [tempTasks, userFilter, search],
  );

  const groupedTasks = useMemo(() => {
    return groupBy(filteredTasks, (t) => t.status);
  }, [filteredTasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const taskItem = event.active.data.current?.task as Tasks[number];
    const newStatus = event.over?.id as TaskStatus;

    if (taskItem.status === newStatus) {
      return;
    }

    setDisabledTasks((prev) => [...prev, taskItem.id]);
    setTempTasks((prev) => {
      const newTasks = prev.map((t) =>
        t.id === taskItem.id ? { ...t, status: newStatus } : t,
      );
      return newTasks;
    });

    return updateTask({
      taskId: taskItem.id,
      status: newStatus,
      projectId,
    }).finally(() => {
      setDisabledTasks((prev) => prev.filter((id) => id !== taskItem.id));
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ProjectPageShell project={project} userId={userId}>
        <ProjectNavigationButtons id={projectId} />

        <div className="m-4">
          <SortTasksHeader
            users={project.users}
            search={search}
            userFilter={userFilter}
            setSearch={setSearch}
            setUserFilter={setUserFilter}
          />
        </div>

        <div className="mt-4 w-full flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-row justify-between gap-4">
            {map(TaskStatus, (status) => (
              <BoardColumn
                key={status}
                tasks={groupedTasks[status] ?? []}
                status={status}
                disabledTasks={disabledTasks}
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
  disabledTasks: string[];
};

const BoardColumn = ({ tasks, status, disabledTasks }: BoardColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      className={cn(
        "flex flex-1 select-none flex-col border border-black bg-black/20 shadow transition-colors",
        isOver ? "border-green-500" : "",
      )}
      ref={setNodeRef}
    >
      <div className="border-b border-black bg-white/10 p-2 font-bold">
        {status.replace("_", " ")}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {map(tasks, (t) => (
          <TaskCard
            key={t.id}
            task={t}
            disabled={disabledTasks.includes(t.id)}
          />
        ))}
      </div>
    </div>
  );
};

type TaskCardProps = {
  task: Tasks[number];
  disabled?: boolean;
};

const TaskCard = ({ task, disabled }: TaskCardProps) => {
  const { attributes, listeners, transform, setNodeRef } = useDraggable({
    id: task.id,
    data: { task },
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Card
      className={cn(
        "flex cursor-move flex-col border border-black/50 bg-white/10 p-2 text-white will-change-transform hover:text-black",
        disabled && "opacity-50",
      )}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center gap-2">
          <div
            className={cn("text-sm", task.status === "DONE" && "line-through")}
          >
            {task.ticker}
          </div>

          {task.asigneeId && <UserAvatar user={task.asignee!} />}
        </div>
      </CardContent>
    </Card>
  );
};
