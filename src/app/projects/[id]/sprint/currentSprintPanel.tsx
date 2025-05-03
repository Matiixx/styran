import { Suspense } from "react";

import { api } from "~/trpc/server";
import { type SprintRouterOutput } from "~/server/api/routers/sprint";

import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

import BurndownChart from "./components/burndownChart";
import SprintPointsArrangement from "./components/sprintPointsArragnement";

type CurrentSprintPanelProps = {
  currentSprintData: NonNullable<SprintRouterOutput["getCurrentSprint"]>;
};

const CurrentSprintPanel = async ({
  currentSprintData,
}: CurrentSprintPanelProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Current Sprint - {currentSprintData.name}</CardTitle>
        <CardDescription>Sprint Goal: {currentSprintData.goal}</CardDescription>
      </CardHeader>

      <CardTitle className="text-xl">Burndown Chart</CardTitle>
      <BurndownChart sprint={currentSprintData} />

      <CardTitle className="text-xl">Story Points Arrangement</CardTitle>
      <SprintPointsArrangement sprint={currentSprintData} />
    </>
  );
};

const CurrentSprintPanelAsync = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const currentSprintData = await api.sprint.getCurrentSprint({
    projectId,
  });

  if (!currentSprintData) {
    return <div>No current sprint found</div>;
  }

  return <CurrentSprintPanel currentSprintData={currentSprintData} />;
};

const CurrentSprintPanelSuspended = ({ projectId }: { projectId: string }) => {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<CurrentSprintPanelLoading />}>
        <CurrentSprintPanelAsync projectId={projectId} />
      </Suspense>
    </div>
  );
};

const CurrentSprintPanelLoading = () => {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          Current Sprint - <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>

      <CardTitle className="text-xl">Burndown Chart</CardTitle>
      <Skeleton className="h-[400px] w-full" />

      <CardTitle className="text-xl">Story Points Arrangement</CardTitle>
      <Skeleton className="h-[400px] w-full" />
    </>
  );
};

export default CurrentSprintPanelSuspended;
