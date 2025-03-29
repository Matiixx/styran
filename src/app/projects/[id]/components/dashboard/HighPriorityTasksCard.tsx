import { Suspense } from "react";

import dayjs from "dayjs";
import filter from "lodash/filter";
import size from "lodash/size";

import { AlertCircle, ArrowDown } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";

type HighPriorityTasksCardSuspendedProps = {
  projectId: string;
};

const IMMEDIATE_ATTENTION_THRESHOLD = 5;

export const HighPriorityTasksCardSuspended = ({
  projectId,
}: HighPriorityTasksCardSuspendedProps) => {
  return (
    <Suspense
      fallback={
        <HighPriorityTasksCard
          highPriorityTasksCount={null}
          immediateAttentionCount={null}
        />
      }
    >
      <HighPriorityTasksCardAsync projectId={projectId} />
    </Suspense>
  );
};

const HighPriorityTasksCardAsync = async ({
  projectId,
}: HighPriorityTasksCardSuspendedProps) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const highPriorityTasks = await api.tasks.getHighPriorityTasks({ projectId });

  const immediateAttentionCount = filter(highPriorityTasks, (task) => {
    const deadline = dayjs(task.doneAt);
    const differenceInDays = deadline.diff(dayjs(), "day");
    return differenceInDays <= IMMEDIATE_ATTENTION_THRESHOLD;
  });

  return (
    <HighPriorityTasksCard
      highPriorityTasksCount={size(highPriorityTasks)}
      immediateAttentionCount={size(immediateAttentionCount)}
    />
  );
};

type HighPriorityTasksCardProps = {
  highPriorityTasksCount: number | null;
  immediateAttentionCount: number | null;
};

const HighPriorityTasksCard = ({
  highPriorityTasksCount,
  immediateAttentionCount,
}: HighPriorityTasksCardProps) => {
  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">High Priority</span>
            {highPriorityTasksCount !== null ? (
              <span className="text-2xl font-bold">
                {highPriorityTasksCount}
              </span>
            ) : (
              <Skeleton className="h-8 w-10" />
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {immediateAttentionCount !== null ? (
            <>
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="font-medium text-red-500">
                {immediateAttentionCount}
              </span>
              <span className="ml-1 text-muted-foreground">
                need immediate attention
              </span>
            </>
          ) : (
            <Skeleton className="h-5 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
