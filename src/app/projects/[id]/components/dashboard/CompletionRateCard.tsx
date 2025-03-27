import { ArrowDown, ArrowRight, ArrowUp, CheckCircle } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

const CompletionRateCard = ({
  completionRate,
  lastMonthCompletionRate,
}: {
  completionRate: number | null;
  lastMonthCompletionRate: number | null;
}) => {
  const completionRateDifference =
    completionRate !== null && lastMonthCompletionRate !== null
      ? completionRate - lastMonthCompletionRate
      : null;

  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Completion Rate</span>
            {completionRate !== null ? (
              <span className="text-2xl font-bold">
                {completionRate.toFixed(0)}%
              </span>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <Progress value={completionRate ?? 0} className="h-2" />
        </div>
        {completionRateDifference !== null && (
          <div className="overflow-hidden">
            <div className="duration-500 animate-in slide-in-from-top-10">
              <ChangeInfo completionRateDifference={completionRateDifference} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ChangeInfo = ({
  completionRateDifference,
}: {
  completionRateDifference: number;
}) => {
  const getColor = () => {
    if (completionRateDifference > 0) {
      return "text-green-500";
    } else if (completionRateDifference < 0) {
      return "text-red-500";
    }
    return "text-gray-500";
  };

  const Icon = () => {
    if (completionRateDifference > 0) {
      return <ArrowUp className={cn("mr-1 h-4 w-4", getColor())} />;
    } else if (completionRateDifference < 0) {
      return <ArrowDown className={cn("mr-1 h-4 w-4", getColor())} />;
    }
    return <ArrowRight className={cn("mr-1 h-4 w-4", getColor())} />;
  };

  return (
    <div className="mt-2 flex items-center text-sm">
      <Icon />
      <span className={cn("font-medium", getColor())}>
        {completionRateDifference.toFixed(0)}pp
      </span>
      <span className="ml-1 text-muted-foreground">from last month</span>
    </div>
  );
};

export { CompletionRateCard };
