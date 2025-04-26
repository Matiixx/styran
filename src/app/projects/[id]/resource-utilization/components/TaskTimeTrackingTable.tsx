import { TaskStatus } from "@prisma/client";

import every from "lodash/every";
import forEach from "lodash/forEach";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import reduce from "lodash/reduce";

import { Clock } from "lucide-react";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { cn } from "~/lib/utils";
import dayjs from "~/utils/dayjs";
import { TimeConstants } from "~/utils/timeUtils";
import {
  getColorByStatus,
  getTaskTypeIcon,
  taskStatusToString,
} from "~/utils/taskUtils";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { stringToRGB } from "../../calendar/utils";

const TaskTimeTrackingTable = ({
  usersUtilization,
}: {
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"];
}) => {
  const groupedUsersUtilizationByTask =
    groupUsersUtilizationByTask(usersUtilization);

  const isEmptyTrackedTime = every(usersUtilization, ({ TimeTrack }) =>
    isEmpty(TimeTrack),
  );

  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Task Time Tracking</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Team Allocation</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isEmptyTrackedTime ? (
              <EmptyTaskTableRow />
            ) : (
              map(groupedUsersUtilizationByTask, (task) => {
                return <TaskTableRow key={task.task.id} task={task} />;
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const TaskTableRow = ({
  task,
}: {
  task: GroupedUsersUtilizationByTask[string];
}) => {
  const totalHours =
    reduce(
      task.usersUtilization,
      (acc, user) => {
        const start = dayjs(user.startTime);
        const end = dayjs(user.endTime);
        return acc + end.diff(start, "milliseconds");
      },
      0,
    ) / TimeConstants.MILLISECONDS_IN_HOUR;

  return (
    <TableRow className="text-base">
      <TableCell className="flex flex-col gap-0.5">
        <div className="flex flex-row items-center gap-2">
          {getTaskTypeIcon(task.task.type)}
          <Badge
            variant="outline"
            className={
              task.task.status === TaskStatus.DONE ? "line-through" : ""
            }
          >
            {task.task.ticker}
          </Badge>
          <p
            className={
              task.task.status === TaskStatus.DONE ? "line-through" : ""
            }
          >
            {task.task.title}
          </p>
        </div>
        <Badge
          disableHover
          className={cn("ml-8 w-fit", getColorByStatus(task.task.status))}
        >
          {taskStatusToString(task.task.status)}
        </Badge>
      </TableCell>
      <TableCell>{totalHours.toFixed(2)}hrs</TableCell>
      <TeamAllocationCell task={task} />
    </TableRow>
  );
};

const TeamAllocationCell = ({
  task,
}: {
  task: GroupedUsersUtilizationByTask[string];
}) => {
  const timePerUser = reduce(
    task.usersUtilization,
    (acc, user) => {
      const start = dayjs(user.startTime);
      const end = dayjs(user.endTime);
      acc[user.userId] ||= 0;
      acc[user.userId]! += end.diff(start, "milliseconds");
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalTime = reduce(timePerUser, (acc, time) => acc + time, 0);

  return (
    <TableCell>
      <div className="flex flex-col gap-1">
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {map(timePerUser, (userTrackTime, userId) => {
            const user = task.usersUtilization.find(
              (user) => user.userId === userId,
            )?.user;
            return (
              <div
                key={userId}
                className="h-full"
                style={{
                  width: `${(userTrackTime / totalTime) * 100}%`,
                  backgroundColor: stringToRGB(user?.email ?? "").background,
                }}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-1 text-sm">
          {map(timePerUser, (userTrackTime, userId) => {
            const user = task.usersUtilization.find(
              (user) => user.userId === userId,
            )?.user;
            return (
              <div key={userId} className="flex flex-row items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: stringToRGB(user?.email ?? "").background,
                  }}
                />
                <span className="text-md">
                  {user?.firstName} {user?.lastName}
                  {": "}
                  {(userTrackTime / TimeConstants.MILLISECONDS_IN_HOUR).toFixed(
                    2,
                  )}
                  hrs ({`${((userTrackTime / totalTime) * 100).toFixed(0)}%`})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </TableCell>
  );
};

const EmptyTaskTableRow = () => {
  return (
    <TableRow>
      <TableCell colSpan={99}>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-semibold">No time tracked yet this week</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Team members haven&apos;t logged any hours for this week. Time
            tracking data will appear here once team members start logging their
            hours.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

type Task =
  ProjectRouterOutput["getProjectResourceUtilization"][number]["TimeTrack"][number]["task"];
type TimeTrack =
  ProjectRouterOutput["getProjectResourceUtilization"][number]["TimeTrack"][number];
type User = { id: string; email: string; lastName: string; firstName: string };

type GroupedUsersUtilizationByTask = Record<
  string,
  { task: Task; usersUtilization: (TimeTrack & { user: User })[] }
>;

const groupUsersUtilizationByTask = (
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"],
) => {
  return reduce(
    usersUtilization,
    (acc, user) => {
      forEach(user.TimeTrack, (timeTrack) => {
        const timeTrackWithUser = {
          ...timeTrack,
          user: {
            id: user.id,
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName,
          },
        };

        if (acc[timeTrack.task.id]) {
          acc[timeTrack.task.id]!.usersUtilization.push(timeTrackWithUser);
        } else {
          acc[timeTrack.task.id] = {
            task: timeTrack.task,
            usersUtilization: [timeTrackWithUser],
          };
        }
      });
      return acc;
    },
    {} as GroupedUsersUtilizationByTask,
  );
};

export default TaskTimeTrackingTable;
