import { api } from "~/trpc/server";

import ActivityFilters from "./ActivityFilters";
import { ActivityRows } from "./ActivityRows";
import ActivityPagination from "./ActivityPagination";

const ActivityPage = ({
  projectId,
  page,
}: {
  projectId: string;
  page?: string;
}) => {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-black">Activity Log</span>
        <span className="text-muted-foreground">
          Track all actions and changes in your project
        </span>
      </div>

      <ActivityFilters projectId={projectId} />

      <ActivityPageAsync page={page} projectId={projectId} />
    </div>
  );
};

const ActivityPageAsync = async ({
  page,
  projectId,
}: {
  page?: string;
  projectId: string;
}) => {
  const { activityLogs, totalPages } = await api.projects.getActivityLogs({
    projectId,
    page: page ? Number(page) : undefined,
  });

  return (
    <>
      <ActivityRows rows={activityLogs} />

      <ActivityPagination page={page} totalPages={totalPages} />
    </>
  );
};

export default ActivityPage;
