import Link from "next/link";

import map from "lodash/map";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import dayjs from "~/utils/dayjs";
import { UserAvatar } from "~/app/_components/UserAvatar";
import { type ActivityType } from "~/lib/schemas/activityType";

import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { getActivityText, getActivityTypeIcon } from "./activityUtils";

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
    <Card disableHover className="flex flex-col gap-2 p-4">
      <div className="flex gap-2">
        <UserAvatar user={activity.user} size="md" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Link href={`/user/${activity.user.id}`}>
              <span className="font-medium">{activity.user.firstName}</span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground">
                  {dayjs(activity.createdAt).fromNow()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {dayjs(activity.createdAt).format("LLL")}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-row items-center gap-1">
            <div className="flex items-center justify-center rounded-full bg-gray-200 p-1">
              {getActivityTypeIcon(
                activity.activityType as ActivityType,
                "h-4 w-4",
              )}
            </div>
            <span>{getActivityText(activity)}</span>
          </div>
        </div>
      </div>
    </Card>
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
