import { Suspense } from "react";

import { api } from "~/trpc/server";
import { type ActivityType } from "~/lib/schemas/activityType";

import ActivityFilters from "./ActivityFilters";
import { ActivityRows } from "./ActivityRows";
import ActivityPagination from "./ActivityPagination";

const ActivityPage = ({
  projectId,
  page,
  searchParams,
}: {
  projectId: string;
  page?: string;
  searchParams: Record<string, string>;
}) => {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-black">Activity Log</span>
        <span className="text-muted-foreground">
          Track all actions and changes in your project
        </span>
      </div>

      <Suspense>
        <ActivityPageContentAsync
          page={page}
          projectId={projectId}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
};

const ActivityPageContentAsync = async ({
  page,
  projectId,
  searchParams,
}: {
  page?: string;
  projectId: string;
  searchParams: Record<string, string | string[]>;
}) => {
  return (
    <>
      <Suspense fallback={<>Loading...</>}>
        <ActivityFiltersAsync projectId={projectId} />
      </Suspense>

      <Suspense fallback={<>Loading...</>}>
        <ActivityLogsContainerAsync
          page={page}
          projectId={projectId}
          searchParams={searchParams}
        />
      </Suspense>
    </>
  );
};

const ActivityFiltersAsync = async ({ projectId }: { projectId: string }) => {
  const users = await api.projects.getProjectMembers({ projectId });

  return <ActivityFilters projectId={projectId} users={users} />;
};

const ActivityLogsContainerAsync = async ({
  page,
  projectId,
  searchParams,
}: {
  page?: string;
  projectId: string;
  searchParams: Record<string, string | string[]>;
}) => {
  const { activityLogs, totalPages } = await api.projects.getActivityLogs({
    projectId,
    page: page ? Number(page) : undefined,
    searchQuery: searchParams.search
      ? (searchParams.search as string)
      : undefined,
    type: searchParams.type ? (searchParams.type as ActivityType) : undefined,
    user: searchParams.user ? (searchParams.user as string) : undefined,
    from: searchParams.from ? Number(searchParams.from) : undefined,
    to: searchParams.to ? Number(searchParams.to) : undefined,
  });

  return (
    <>
      <ActivityRows rows={activityLogs} />

      <ActivityPagination
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </>
  );
};

export default ActivityPage;
