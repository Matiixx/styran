import { useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";

const useLiveTask = (projectId: string, taskId: string) => {
  const unsubscribeRef = useRef(false);
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
      onData: (task) => setTask(task.data),
      onComplete: () => !unsubscribeRef.current && taskSubscription.reset(),
    },
  );

  const commentsSubscription =
    api.taskComments.onTaskCommentUpsert.useSubscription(
      { projectId, taskId },
      {
        onData: (comments) => setComments(comments.data),
        onComplete: () =>
          !unsubscribeRef.current && commentsSubscription.reset(),
      },
    );

  const trackTimesSubscription =
    api.timeTracker.onTrackTimesUpsert.useSubscription(
      { projectId, taskId },
      {
        onData: (trackTimes) => setTrackTimes(trackTimes.data),
        onComplete: () =>
          !unsubscribeRef.current && trackTimesSubscription.reset(),
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

  useEffect(() => {
    return () => {
      unsubscribeRef.current = true;
    };
  }, []);

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
