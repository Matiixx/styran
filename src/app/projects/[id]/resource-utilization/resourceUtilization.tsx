import { Suspense } from "react";

import isEmpty from "lodash/isEmpty";

import { api } from "~/trpc/server";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { ResourceUtilizationDuration } from "~/lib/resourceUtilization/durations";

import dayjs from "~/utils/dayjs";
import { getCurrentDayInTimezone } from "~/utils/timeUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import ResourceUtilizationCards from "./components/ResourceUtilizationCards";
import DailyUtilizationChart from "./components/DailyUtilizationChart";
import TaskTimeTrackingTable from "./components/TaskTimeTrackingTable";
import { ResourceUtilizationTabs } from "./components/resourceUtilizaionTabs";

const ResourceUtilization = ({
  project,
  duration,
}: {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
  duration: ResourceUtilizationDuration;
}) => {
  const hasActiveSprint = !isEmpty(project.sprint);

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <span className="text-2xl font-bold text-black">
          Resource Utilization
        </span>

        <ResourceUtilizationTabs
          duration={duration}
          hasActiveSprint={hasActiveSprint}
        />
      </div>

      <Suspense
        fallback={
          <div className="flex-1 text-center text-black">Loading...</div>
        }
      >
        <ResourceUtilizationAsync project={project} duration={duration} />
      </Suspense>
    </div>
  );
};

const ResourceUtilizationAsync = async ({
  project,
  duration,
}: {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
  duration: ResourceUtilizationDuration;
}) => {
  const usersUtilization = await api.projects.getProjectResourceUtilization({
    projectId: project.id,
    duration,
  });

  const daysDuration = getDaysDuration(duration, project);
  const workingDaysAmount = getWorkingDaysAmount(duration, project);
  const startDate = getStartDate(duration, project);

  return (
    <>
      <div className="flex flex-row justify-between gap-4">
        <ResourceUtilizationCards
          daysDuration={daysDuration}
          usersUtilization={usersUtilization}
          workingDaysAmount={workingDaysAmount}
        />
      </div>
      <Card disableHover>
        <CardHeader>
          <CardTitle>Daily Utilization Chart</CardTitle>
          <CardDescription>
            Hours logged per team member per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyUtilizationChart
            startDate={startDate}
            daysDuration={daysDuration}
            usersUtilization={usersUtilization}
          />
        </CardContent>
      </Card>

      <TaskTimeTrackingTable usersUtilization={usersUtilization} />
    </>
  );
};

const getDaysDuration = (
  duration: ResourceUtilizationDuration,
  project: NonNullable<ProjectRouterOutput["getProject"]>,
) => {
  const today = getCurrentDayInTimezone(project.timezone);

  if (duration === ResourceUtilizationDuration.SPRINT && !!project.sprint[0]) {
    return dayjs(project.sprint[0].endAt).diff(
      dayjs(project.sprint[0].startAt),
      "days",
    );
  }

  if (duration === ResourceUtilizationDuration.MONTH) {
    return today.daysInMonth();
  }

  return 7;
};

const getWorkingDaysAmount = (
  duration: ResourceUtilizationDuration,
  project: NonNullable<ProjectRouterOutput["getProject"]>,
) => {
  const today = getCurrentDayInTimezone(project.timezone);

  if (duration === ResourceUtilizationDuration.SPRINT && !!project.sprint[0]) {
    const startDate = dayjs(project.sprint[0].startAt);
    const endDate = dayjs(project.sprint[0].endAt);

    return countWeekdays(startDate, endDate);
  }

  if (duration === ResourceUtilizationDuration.MONTH) {
    const startDate = today.startOf("month");
    const endDate = today.endOf("month");

    return countWeekdays(startDate, endDate);
  }

  return 5;
};

const countWeekdays = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  let workingDays = 0;
  let currentDay = startDate;

  while (currentDay.isBefore(endDate) || currentDay.isSame(endDate, "day")) {
    const dayOfWeek = currentDay.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDay = currentDay.add(1, "day");
  }

  return workingDays;
};

const getStartDate = (
  duration: ResourceUtilizationDuration,
  project: NonNullable<ProjectRouterOutput["getProject"]>,
) => {
  const today = getCurrentDayInTimezone(project.timezone);

  if (duration === ResourceUtilizationDuration.SPRINT && !!project.sprint[0]) {
    return project.sprint[0].startAt;
  }

  if (duration === ResourceUtilizationDuration.MONTH) {
    return today.startOf("month").toDate();
  }

  return today.startOf("week").toDate();
};
export default ResourceUtilization;
