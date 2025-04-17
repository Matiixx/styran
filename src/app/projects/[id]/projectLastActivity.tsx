"use client";

import Link from "next/link";

import map from "lodash/map";

import { type Task } from "@prisma/client";
import { api } from "~/trpc/react";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { ActivityType } from "~/lib/schemas/activityType";
import dayjs from "~/utils/dayjs";

import { UserAvatar } from "~/app/_components/UserAvatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type ProjectLastActivityProps = {
  projectId: string;
};

export default function ProjectLastActivity({
  projectId,
}: ProjectLastActivityProps) {
  const { data: activityLogs } = api.projects.getLastActivity.useQuery({
    projectId,
  });

  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent activity in the project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {map(activityLogs, (activity) => (
            <AcivityCard key={activity.id} activity={activity} />
          ))}
        </div>

        <Button variant="outline" className="mt-4 w-full">
          View more
        </Button>
      </CardContent>
    </Card>
  );
}

const AcivityCard = ({
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

const getActivityText = (
  activity: ProjectRouterOutput["getLastActivity"][number],
) => {
  const activityType = activity.activityType as ActivityType;

  if (activityType === ActivityType.TaskCreated) {
    const task = JSON.parse(activity.newValue ?? "{}") as Task;

    return (
      <>
        {activity.user.firstName} created a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${activity.task?.id}`}
          className="font-semibold"
        >
          [{task?.ticker}]
        </Link>{" "}
        {task?.title}
      </>
    );
  } else if (activityType === ActivityType.TaskUpdated) {
    const task = JSON.parse(activity.newValue ?? "{}") as Task;

    return (
      <>
        {activity.user.firstName} updated a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${activity.task?.id}`}
          className="font-semibold"
        >
          [{task?.ticker}]
        </Link>{" "}
        {task?.title}
      </>
    );
  } else if (activityType === ActivityType.TaskDeleted) {
    const task = JSON.parse(activity.oldValue ?? "{}") as Task;
    return (
      <>
        {activity.user.firstName} deleted a task{" "}
        <span className="font-semibold">[{task.ticker}]</span> {task.title}
      </>
    );
  } else if (activityType === ActivityType.CommentCreated) {
    return (
      <>
        {activity.user.firstName} commented on a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${activity.task?.id}`}
          className="font-semibold"
        >
          [{activity.task?.ticker}]
        </Link>{" "}
        {activity.task?.title}
      </>
    );
  } else if (activityType === ActivityType.CommentUpdated) {
    const comment = JSON.parse(activity.newValue ?? "{}") as {
      taskId: string;
      task: { ticker: string; title: string };
    };

    return (
      <>
        {activity.user.firstName} updated a comment on a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${comment.taskId}`}
          className="font-semibold"
        >
          [{comment.task.ticker}]
        </Link>{" "}
        {comment.task.title}
      </>
    );
  } else if (activityType === ActivityType.CommentDeleted) {
    const comment = JSON.parse(activity.oldValue ?? "{}") as {
      taskId: string;
      task: { ticker: string; title: string };
    };

    return (
      <>
        {activity.user.firstName} deleted a comment on a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${comment.taskId}`}
          className="font-semibold"
        >
          [{comment.task.ticker}]
        </Link>{" "}
        {comment.task.title}
      </>
    );
  } else if (activityType === ActivityType.SprintCreated) {
    const sprint = JSON.parse(activity.newValue ?? "{}") as { name: string };

    return (
      <>
        {activity.user.firstName} started new sprint{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog`}
          className="font-semibold"
        >
          {sprint.name}
        </Link>
      </>
    );
  } else if (activityType === ActivityType.SprintCompleted) {
    const sprint = JSON.parse(activity.newValue ?? "{}") as { name: string };

    return (
      <>
        {activity.user.firstName} completed sprint{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog`}
          className="font-semibold"
        >
          {sprint.name}
        </Link>
      </>
    );
  } else if (activityType === ActivityType.TimeTrackCreated) {
    const timeTrack = JSON.parse(activity.newValue ?? "{}") as {
      taskId: string;
      task: { ticker: string; title: string };
    };

    return (
      <>
        {activity.user.firstName} added time tracking for a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${timeTrack.taskId}`}
          className="font-semibold"
        >
          [{timeTrack.task.ticker}]
        </Link>{" "}
        {timeTrack.task.title}
      </>
    );
  } else if (activityType === ActivityType.TimeTrackUpdated) {
    const timeTrack = JSON.parse(activity.newValue ?? "{}") as {
      taskId: string;
      task: { ticker: string; title: string };
    };

    return (
      <>
        {activity.user.firstName} updated time tracking for a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${timeTrack.taskId}`}
          className="font-semibold"
        >
          [{timeTrack.task.ticker}]
        </Link>{" "}
        {timeTrack.task.title}
      </>
    );
  } else if (activityType === ActivityType.TimeTrackDeleted) {
    const timeTrack = JSON.parse(activity.oldValue ?? "{}") as {
      taskId: string;
      task: { ticker: string; title: string };
    };

    return (
      <>
        {activity.user.firstName} deleted time tracking for a task{" "}
        <Link
          href={`/projects/${activity.projectId}/backlog/task/${timeTrack.taskId}`}
          className="font-semibold"
        >
          [{timeTrack.task.ticker}]
        </Link>{" "}
        {timeTrack.task.title}
      </>
    );
  }
};
