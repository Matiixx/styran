import { ArrowUp, List } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const TotalTasksCard = ({
  currentMonthTasksCount,
  previousMonthTasksCount,
}: {
  currentMonthTasksCount: number | null;
  previousMonthTasksCount: number | null;
}) => {
  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">
              Monthly Completed Tasks
            </span>
            {currentMonthTasksCount !== null ? (
              <span className="text-2xl font-bold">
                {currentMonthTasksCount}
              </span>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <List className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {currentMonthTasksCount !== null &&
          previousMonthTasksCount !== null ? (
            <>
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="font-medium text-green-500">
                {previousMonthTasksCount === 0
                  ? `+inf`
                  : ((currentMonthTasksCount - previousMonthTasksCount) /
                      previousMonthTasksCount) *
                    100}
                %
              </span>
              <span className="ml-1 text-muted-foreground">
                from last month
              </span>
            </>
          ) : (
            <Skeleton className="h-4 w-1/2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { TotalTasksCard };
