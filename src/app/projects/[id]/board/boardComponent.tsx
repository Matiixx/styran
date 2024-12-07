"use client";

import { useMemo } from "react";
import { TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import groupBy from "lodash/groupBy";
import map from "lodash/map";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import ProjectPageShell from "../projectPageShell";

type BoardComponentProps = {
  userId: string;
  projectId: string;
};

export default function BoardComponent({
  userId,
  projectId,
}: BoardComponentProps) {
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  if (!project) {
    redirect("/projects");
  }

  const groupedTasks = useMemo(() => {
    return groupBy(tasks, (t) => t.status);
  }, [tasks]);

  return (
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
  );
}

type Tasks = TasksRouterOutput["getTasks"];

type BoardColumnProps = {
  tasks: Tasks;
  status: TaskStatus;
};

const BoardColumn = ({ tasks, status }: BoardColumnProps) => {
  return (
    <div className="flex flex-1 select-none flex-col border border-black bg-black/20 shadow">
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
  return (
    <Card className="flex cursor-move flex-col border border-black/50 bg-white/10 p-2 text-white hover:text-black">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{task.ticker}</div>
      </CardContent>
    </Card>
  );
};
