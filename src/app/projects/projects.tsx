"use client";

import { useState } from "react";
import Link from "next/link";

import { CheckCircle } from "lucide-react";

import find from "lodash/find";
import map from "lodash/map";
import reduce from "lodash/reduce";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { api } from "~/trpc/react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

import AddNewProjectDialog from "./newProjectDialog";
import { AvatarGroup } from "../_components/UserAvatar";

export default function ProjectsComponent() {
  const [open, setOpen] = useState(false);

  const [data] = api.projects.getProjects.useSuspenseQuery();
  const [tasksStats] = api.tasks.getProjectsTasksStats.useSuspenseQuery();

  return (
    <div className="flex w-full flex-1 overflow-y-auto">
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-16 py-16 pt-32">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AddNewProjectDialog open={open} setOpen={setOpen} />

            {map(data, ({ name, ticker, users, id }) => {
              return (
                <ProjectCard
                  key={id}
                  id={id}
                  name={name}
                  users={users}
                  ticker={ticker}
                  taskStats={tasksStats[id] ?? []}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const ProjectCard = ({
  id,
  name,
  users,
  ticker,
  taskStats,
}: {
  id: string;
  name: string;
  users: ProjectRouterOutput["getProjects"][number]["users"];
  ticker: string;
  taskStats: TasksRouterOutput["getProjectsTasksStats"][string];
}) => {
  const doneTasks =
    find(taskStats, (task) => task.status === "DONE")?._count.status ?? 0;
  const totalTasks = reduce(
    taskStats,
    (acc, curr) => acc + curr._count.status,
    0,
  );

  return (
    <Link
      href={`/projects/${id}`}
      key={id}
      className="w-full max-w-sm cursor-pointer"
    >
      <Card className="flex h-[250px] w-full flex-col">
        <CardHeader>
          <CardTitle className="truncate">
            [{ticker}] - {name}
          </CardTitle>
          <CardDescription className="truncate">Description</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {(((doneTasks || 0) / (totalTasks || 1)) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(doneTasks / totalTasks) * 100} className="h-2" />
          </div>
          <div className="flex w-full flex-row items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>
              {doneTasks || 0}/{totalTasks || 0} tasks
            </span>
          </div>

          <div className="w-full">
            <AvatarGroup users={users ?? []} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
