import { Suspense } from "react";

import { api } from "~/trpc/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ChartContainer } from "~/components/ui/chart";
import { ProjectTaskUsersChart } from "./components/dashboard/ProjectTaskUsersChart";

type ProjectTaskUsersCardProps = {
  projectId: string;
};

const ProjectTaskUsersCard = ({ projectId }: ProjectTaskUsersCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task by User</CardTitle>
        <CardDescription>
          Distribution of tasks among team members
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense
          fallback={
            <div className="mt-8 flex w-full flex-1 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          }
        >
          <ProjectTaskUsersCardAsync projectId={projectId} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

const ProjectTaskUsersCardAsync = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const tasks = await api.tasks.getTasksByUser({ projectId });

  const tasksByUser = tasks.reduce(
    (acc, task) => {
      if (!task.asignee) return acc;
      const asigneeId = task.asignee.id;

      if (acc[asigneeId]) {
        acc[asigneeId].count++;
      } else {
        acc[asigneeId] = {
          asigneeId,
          count: 1,
          user: task.asignee,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        asigneeId: string;
        count: number;
        user: NonNullable<(typeof tasks)[number]["asignee"]>;
      }
    >,
  );

  return (
    <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
      <ProjectTaskUsersChart data={tasksByUser} />
    </ChartContainer>
  );
};

export default ProjectTaskUsersCard;
