import Link from "next/link";

import { type Task } from "@prisma/client";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { ActivityType } from "~/lib/schemas/activityType";

export  const getActivityText = (
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
