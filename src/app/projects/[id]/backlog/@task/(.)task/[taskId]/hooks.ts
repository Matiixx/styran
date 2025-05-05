import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

const useLiveTask = (projectId: string, taskId: string) => {
  const [taskQuery] = api.tasks.getTask.useSuspenseQuery({ projectId, taskId });
  const [task, setTask] = useState(taskQuery);

  const [commentsQuery] = api.taskComments.getComments.useSuspenseQuery({
    taskId,
    projectId,
  });
  const [comments, setComments] = useState(commentsQuery);

  const [trackTimesQuery] = api.timeTracker.getTimes.useSuspenseQuery({
    taskId,
  });
  const [trackTimes, setTrackTimes] = useState(trackTimesQuery);

  const taskSubscription = api.tasks.onTaskUpsert.useSubscription(
    { projectId, taskId },
    {
      onData: (task) => {
        if (!task.data || "_heartbeat" in task.data) {
          return;
        }
        setTask(task.data);
      },
    },
  );

  const commentsSubscription =
    api.taskComments.onTaskCommentUpsert.useSubscription(
      { projectId, taskId },
      {
        onData: (comments) => {
          if (!comments.data || "_heartbeat" in comments.data) {
            return;
          }
          setComments(comments.data);
        },
      },
    );

  const trackTimesSubscription =
    api.timeTracker.onTrackTimesUpsert.useSubscription(
      { projectId, taskId },
      {
        onData: (trackTimes) => {
          if (!trackTimes.data || "_heartbeat" in trackTimes.data) {
            return;
          }
          setTrackTimes(trackTimes.data);
        },
      },
    );

  useEffect(() => {
    setTask(taskQuery);
  }, [taskQuery]);

  useEffect(() => {
    setComments(commentsQuery);
  }, [commentsQuery]);

  useEffect(() => {
    setTrackTimes(trackTimesQuery);
  }, [trackTimesQuery]);

  return {
    task,
    comments,
    trackTimes,
    taskSubscription,
    commentsSubscription,
    trackTimesSubscription,
  };
};

export { useLiveTask };
