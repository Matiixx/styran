import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import dayjs from "~/utils/dayjs";
// import { api } from "~/trpc/react";

import Link from "next/link";

import { UserAvatar } from "~/app/_components/UserAvatar";

import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { getActivityText } from "./activityUtils";

export const ActivityRows = ({
  rows,
}: {
  rows: ProjectRouterOutput["getActivityLogs"]["activityLogs"];
}) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {map(rows, (row) => {
        return <AcivityCard key={row.id} activity={row} />;
      })}
    </div>
  );
};

export const AcivityCard = ({
  activity,
}: {
  activity: ProjectRouterOutput["getLastActivity"][number];
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <UserAvatar user={activity.user} size="sm" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href={`/user/${activity.user.id}`}>
              <span className="font-medium">{activity.user.firstName}</span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {dayjs(activity.createdAt).fromNow()}
            </span>
          </div>

          <span>{getActivityText(activity)}</span>
        </div>
      </div>
      <Separator />
    </div>
  );
};

export const ActivityCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <span className="text-muted-foreground">•</span>
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-6 w-[250px]" />
        </div>
      </div>
      <Separator />
    </div>
  );
};
