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

  const subscription = api.tasks.onTasksUpsert.useSubscription(
    { projectId },
    { onData: (tasks) => addTask(tasks.data) },
  );

  useEffect(() => {
    const resetSubscription = () => {
      subscription.reset();

      setTimeout(resetSubscription, 50_000);
    };

    setTimeout(resetSubscription, 50_000);
  }, [projectId]);

  return { tasks, subscription };
};

export { useLiveTasks };
