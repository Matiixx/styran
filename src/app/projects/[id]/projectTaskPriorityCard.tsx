import { Suspense } from "react";

import map from "lodash/map";

import { TaskPriority } from "@prisma/client";

import { api } from "~/trpc/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { ProjectPriorityChart } from "./components/dashboard/projectPriorityChart";
import { getColorByPriority } from "~/utils/taskUtils";

type ProjectTaskPriorityCardProps = {
  projectId: string;
};

const ProjectTaskPriorityCard = ({
  projectId,
}: ProjectTaskPriorityCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task Priority</CardTitle>
        <CardDescription>
          Distribution of tasks by priority level
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
          <ProjectPriorityChartAsync projectId={projectId} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

const ProjectPriorityChartAsync = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const data = await api.tasks.getTasksByPriority({ projectId });

  const parsedData = map(TaskPriority, (priority) => {
    const count = data.find((item) => item.priority === priority)?._count
      .priority;
    return {
      priority,
      count: count ?? 0,
      color: getColorByPriority(priority).color,
    };
  });

  return <ProjectPriorityChart taskPriorityData={parsedData} />;
};

export default ProjectTaskPriorityCard;
