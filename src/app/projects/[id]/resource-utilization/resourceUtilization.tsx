import { Suspense } from "react";

import { api } from "~/trpc/server";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import ResourceUtilizationCards from "./components/ResourceUtilizationCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import DailyUtilizationChart from "./components/DailyUtilizationChart";
import TaskTimeTrackingTable from "./components/TaskTimeTrackingTable";

const ResourceUtilization = ({
  project,
}: {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
}) => {
  return (
    <div className="flex w-full flex-col gap-8">
      <span className="text-2xl font-bold text-black">
        Resource Utilization
      </span>

      <Suspense
        fallback={
          <div className="flex-1 text-center text-black">Loading...</div>
        }
      >
        <ResourceUtilizationAsync
          timezone={project.timezone}
          projectId={project.id}
        />
      </Suspense>
    </div>
  );
};

const ResourceUtilizationAsync = async ({
  timezone,
  projectId,
}: {
  timezone: number;
  projectId: string;
}) => {
  const usersUtilization = await api.projects.getProjectResourceUtilization({
    projectId,
  });

  return (
    <>
      <div className="flex flex-row justify-between gap-4">
        <ResourceUtilizationCards usersUtilization={usersUtilization} />
      </div>
      <Card disableHover>
        <CardHeader>
          <CardTitle>Daily Utilization Chart</CardTitle>
          <CardDescription>
            Hours logged per team member per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyUtilizationChart
            timezone={timezone}
            usersUtilization={usersUtilization}
          />
        </CardContent>
      </Card>

      <TaskTimeTrackingTable usersUtilization={usersUtilization} />
    </>
  );
};

export default ResourceUtilization;
