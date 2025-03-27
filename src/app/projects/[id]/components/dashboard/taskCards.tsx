import { Suspense } from "react";
import { api } from "~/trpc/server";

import { CompletionRateCard } from "./CompletionRateCard";
import { TotalTasksCard } from "./TotalTasksCard";

type TaskCardsSuspendedProps = {
  projectId: string;
};

const TaskCardsSuspended = ({ projectId }: TaskCardsSuspendedProps) => {
  return (
    <Suspense
      fallback={
        <>
          <TotalTasksCard
            currentMonthTasksCount={null}
            previousMonthTasksCount={null}
          />
          <CompletionRateCard
            completionRate={null}
            lastMonthCompletionRate={null}
          />
        </>
      }
    >
      <TaskCardsAsync projectId={projectId} />
    </Suspense>
  );
};

const TaskCardsAsync = async ({ projectId }: TaskCardsSuspendedProps) => {
  const {
    currentMonthTasksCount,
    previousMonthTasksCount,
    groupedTasksCount,
    lastMonthGroupedTasksCount,
  } = await api.tasks.getCompletedTaskCount({ projectId });

  const totalTasks = groupedTasksCount.reduce(
    (acc, curr) =>
      acc + ((curr._count as { status: number | undefined })?.status ?? 0),
    0,
  );
  const doneTasks = (
    groupedTasksCount.find((task) => task.status === "DONE")?._count as {
      status: number | undefined;
    }
  ).status;

  const lastMonthDoneTasks = (
    lastMonthGroupedTasksCount.find((task) => task.status === "DONE")
      ?._count as {
      status: number | undefined;
    }
  ).status;

  const lastMonthTotalTasks = lastMonthGroupedTasksCount.reduce(
    (acc, curr) =>
      acc + ((curr._count as { status: number | undefined })?.status ?? 0),
    0,
  );

  const completionRate = ((doneTasks ?? 0) / (totalTasks ?? 1)) * 100;
  const lastMonthCompletionRate =
    ((lastMonthDoneTasks ?? 0) / (lastMonthTotalTasks ?? 1)) * 100;

  return (
    <>
      <TotalTasksCard
        currentMonthTasksCount={currentMonthTasksCount}
        previousMonthTasksCount={previousMonthTasksCount}
      />
      <CompletionRateCard
        completionRate={completionRate}
        lastMonthCompletionRate={lastMonthCompletionRate}
      />
    </>
  );
};

export { TaskCardsSuspended };
