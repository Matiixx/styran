import { Clock, Timer, Users } from "lucide-react";

import reduce from "lodash/reduce";
import size from "lodash/size";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import dayjs from "~/utils/dayjs";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

const ResourceUtilizationCards = ({
  daysDuration,
  usersUtilization,
  workingDaysAmount,
}: {
  daysDuration: number;
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"];
  workingDaysAmount: number;
}) => {
  const totalAmount = reduce(
    usersUtilization,
    (acc, user) => {
      return (
        acc +
        reduce(
          user.TimeTrack,
          (acc, timeTrack) => {
            const startTime = dayjs(timeTrack.startTime);
            const endTime = timeTrack.endTime
              ? dayjs(timeTrack.endTime)
              : dayjs();
            return acc + endTime.diff(startTime, "milliseconds");
          },
          0,
        )
      );
    },
    0,
  );

  const userCount = size(usersUtilization);

  return (
    <>
      <TotalHoursCard
        duration={daysDuration}
        userCount={userCount}
        totalAmount={totalAmount}
        workingDaysAmount={workingDaysAmount}
      />
      <AverageUtilizationCard
        userCount={userCount}
        totalAmount={totalAmount}
        workingDaysAmount={workingDaysAmount}
      />
      <AverageDailyUtilizationCard
        userCount={userCount}
        totalAmount={totalAmount}
        workingDaysAmount={workingDaysAmount}
      />
    </>
  );
};

const TotalHoursCard = ({
  duration,
  userCount,
  totalAmount,
  workingDaysAmount,
}: {
  duration: number;
  userCount: number;
  totalAmount: number;
  workingDaysAmount: number;
}) => {
  const totalHours = totalAmount / 1000 / 60 / 60;

  const maxHours = userCount * 8 * workingDaysAmount;

  return (
    <Card className="w-full" disableHover>
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Total hours</span>
            <span className="text-2xl font-bold">
              {totalHours.toFixed(2)} / {maxHours}hrs
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <span className="ml-1 text-sm text-muted-foreground">
          across current {getPeriodText(duration)}
        </span>
      </CardContent>
    </Card>
  );
};

const getPeriodText = (duration: number) => {
  if (duration > 20) {
    return "month";
  } else if (duration > 7) {
    return "sprint";
  } else {
    return "working week";
  }
};

const AverageUtilizationCard = ({
  userCount,
  totalAmount,
  workingDaysAmount,
}: {
  userCount: number;
  totalAmount: number;
  workingDaysAmount: number;
}) => {
  const totalHours = totalAmount / 1000 / 60 / 60;

  const averageUtilization =
    (totalHours / (userCount * 8 * workingDaysAmount)) * 100;

  return (
    <Card className="w-full" disableHover>
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Average utilization</span>
            <span className="text-2xl font-bold">
              {averageUtilization.toFixed(2)}%
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>
        <Progress value={averageUtilization} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
};

const AverageDailyUtilizationCard = ({
  userCount,
  totalAmount,
  workingDaysAmount,
}: {
  userCount: number;
  totalAmount: number;
  workingDaysAmount: number;
}) => {
  const totalHours = totalAmount / 1000 / 60 / 60;

  const averageDailyUtilization =
    totalHours / userCount / (workingDaysAmount || 1);

  return (
    <Card className="w-full" disableHover>
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">
              Average daily utilization
            </span>
            <span className="text-2xl font-bold">
              {averageDailyUtilization.toFixed(2)}hrs
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Timer className="h-6 w-6 text-primary" />
          </div>
        </div>
        <span className="ml-1 text-sm text-muted-foreground">per user</span>
      </CardContent>
    </Card>
  );
};

export default ResourceUtilizationCards;
