import { Suspense } from "react";

import { api } from "~/trpc/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import ProjectTaskStatusCardClient from "./components/dashboard/ProjectTaskStatusCardClient";
import { taskStatusToString } from "~/utils/taskUtils";

type ProjectTaskStatusCardProps = {
  projectId: string;
};

const ProjectTaskStatusCard = ({ projectId }: ProjectTaskStatusCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task Status</CardTitle>
        <CardDescription>
          Distribution of tasks by current status
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
          <ProjectTaskStatusCardAsync projectId={projectId} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

const ProjectTaskStatusCardAsync = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const taskStatusData = await api.tasks.getTasksByStatus({ projectId });

  return <ProjectTaskStatusCardClient taskStatusData={taskStatusData} />;
};

export default ProjectTaskStatusCard;
