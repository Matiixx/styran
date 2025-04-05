import { Suspense } from "react";

import { Clock } from "lucide-react";

import map from "lodash/map";
import reduce from "lodash/reduce";
import sortBy from "lodash/sortBy";

import { api } from "~/trpc/server";
import dayjs from "~/utils/dayjs";
import { cn } from "~/lib/utils";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { UserAvatar } from "~/app/_components/UserAvatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import ResourceUtilizationButton from "./components/dashboard/ResourceUtilizationButton";

type ProjectResourceUtilizationProps = {
  projectId: string;
};

export default function ProjectResourceUtilization({
  projectId,
}: ProjectResourceUtilizationProps) {
  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
        <CardDescription>
          Team members&apos; hours worked vs. capacity
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectResourceUtilizationAsync projectId={projectId} />
          </Suspense>
        </div>

        <ResourceUtilizationButton projectId={projectId} />
      </CardContent>
    </Card>
  );
}

const ProjectResourceUtilizationAsync = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const usersUtilization = await api.projects.getProjectResourceUtilization({
    projectId,
  });

  const parsedUsersUtilization = parseUsersUtilization(usersUtilization);

  return (
    <>
      {map(
        parsedUsersUtilization,
        ({ firstName, lastName, email, utilization, id: userId }) => (
          <UserUtilization
            key={userId}
            user={{ email, firstName, lastName, userId }}
            utilization={utilization}
          />
        ),
      )}
    </>
  );
};

const parseUsersUtilization = (
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"],
) => {
  const utlizationMap = map(usersUtilization, (user) => {
    return {
      ...user,
      utilization: reduce(
        user.TimeTrack,
        (acc, { startTime, endTime }) => {
          const start = dayjs(startTime);
          const end = endTime ? dayjs(endTime) : dayjs();
          return acc + end.diff(start, "milliseconds");
        },
        0,
      ),
    };
  });

  return sortBy(utlizationMap, ({ utilization }) => -1 * utilization);
};

const UserUtilization = ({
  user,
  utilization,
}: {
  user: { email: string; firstName: string; lastName: string; userId: string };
  utilization: number;
}) => {
  const utilizationInHours = utilization / 1000 / 60 / 60;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar size="md" user={user} />
          <span>{`${user.firstName} ${user.lastName}`}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            getUtilizationColor(utilizationInHours),
          )}
        >
          <Clock size={16} />
          <span>{utilizationInHours.toFixed(2)}/40 hrs</span>
        </div>
      </div>
      <div>
        <Progress value={(utilizationInHours / 40) * 100} className="h-2" />
      </div>
      <span
        className={cn(
          "text-xs text-muted-foreground",
          utilizationInHours > 40 && "text-red-500",
        )}
      >
        Utilization {((utilizationInHours / 40) * 100).toFixed(2)}%
      </span>
      <Separator />
    </div>
  );
};

const getUtilizationColor = (utilization: number) => {
  if ((utilization / 40) * 100 > 90) return "text-red-500";
  if ((utilization / 40) * 100 > 75) return "text-yellow-500";
  return "text-green-500";
};
