import { useCallback, useEffect, useRef, useState } from "react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import { api } from "~/trpc/react";

type Tasks = TasksRouterOutput["getTasks"];

const useLiveTasks = (projectId: string) => {
  const unsubscribeRef = useRef(false);
  const [tasksQuery] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  const [tasks, setTasks] = useState<Tasks>(tasksQuery);

  const subscription = api.tasks.onTasksUpsert.useSubscription(
    { projectId },
    {
      onData: (tasks) => addTask(tasks.data),
      onComplete: () => !unsubscribeRef.current && subscription.reset(),
    },
  );

  const addTask = useCallback((incomingTask?: Tasks) => {
    setTasks((prevTasks) => {
      return incomingTask ?? prevTasks;
    });
  }, []);

  useEffect(() => {
    addTask(tasksQuery);
  }, [addTask, tasksQuery]);

  useEffect(() => {
    return () => {
      unsubscribeRef.current = true;
    };
  }, []);

  return { tasks, subscription };
};

export { useLiveTasks };
