import { Suspense } from "react";

import { api } from "~/trpc/server";

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

const ResourceUtilization = ({ projectId }: { projectId: string }) => {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 overflow-y-auto bg-white p-4">
      <span className="text-2xl font-bold text-black">
        Resource Utilization
      </span>

      <Suspense
        fallback={
          <div className="flex-1 text-center text-black">Loading...</div>
        }
      >
        <ResourceUtilizationAsync projectId={projectId} />
      </Suspense>
    </div>
  );
};

const ResourceUtilizationAsync = async ({
  projectId,
}: {
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
          <DailyUtilizationChart usersUtilization={usersUtilization} />
        </CardContent>
      </Card>

      <TaskTimeTrackingTable usersUtilization={usersUtilization} />
    </>
  );
};

export default ResourceUtilization;
