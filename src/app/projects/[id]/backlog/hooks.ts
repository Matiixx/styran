import { useCallback, useEffect, useState } from "react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import { api } from "~/trpc/react";

type Tasks = TasksRouterOutput["getTasks"];

const useLiveTasks = (projectId: string) => {
  const [tasksQuery] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  const [tasks, setTasks] = useState<Tasks>(tasksQuery);

  const addTask = useCallback((incomingTask?: Tasks) => {
    setTasks((prevTasks) => {
      return incomingTask ?? prevTasks;
    });
  }, []);

  useEffect(() => {
    addTask(tasksQuery);
  }, [addTask, tasksQuery]);

  const subscription = api.tasks.onTaskUpsert.useSubscription(
    { projectId },
    { onData: (tasks) => addTask(tasks.data) },
  );

  return { tasks, subscription };
};

export { useLiveTasks };
