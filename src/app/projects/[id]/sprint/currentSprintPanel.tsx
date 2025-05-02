import { api } from "~/trpc/server";

import { CardHeader, CardTitle } from "~/components/ui/card";

import BurndownChart from "./components/burndownChart";

type CurrentSprintPanelProps = {
  projectId: string;
};

const CurrentSprintPanel = async ({ projectId }: CurrentSprintPanelProps) => {
  const currentSprintData = await api.sprint.getCurrentSprint({
    projectId,
  });

  if (!currentSprintData) {
    return <div>No current sprint found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Current Sprint - {currentSprintData.name}</CardTitle>
      </CardHeader>

      <CardTitle className="text-xl">Burndown Chart</CardTitle>
      <BurndownChart sprint={currentSprintData} />
    </div>
  );
};

export default CurrentSprintPanel;
