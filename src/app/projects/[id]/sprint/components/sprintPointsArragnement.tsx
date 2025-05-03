import { type SprintRouterOutput } from "~/server/api/routers/sprint";
import { api } from "~/trpc/server";

import PointsArrangementChart from "./pointsArrangementChart";

type SprintPointsArrangementProps = {
  sprint: NonNullable<SprintRouterOutput["getCurrentSprint"]>;
};

const SprintPointsArrangement = async ({
  sprint,
}: SprintPointsArrangementProps) => {
  const users = await api.projects.getProjectMembers({
    projectId: sprint.projectId,
  });

  return <PointsArrangementChart users={users} sprint={sprint} />;
};

export default SprintPointsArrangement;
