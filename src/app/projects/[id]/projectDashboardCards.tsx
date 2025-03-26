import { Suspense } from "react";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  List,
  Users,
} from "lucide-react";

import { api } from "~/trpc/server";

import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import { Skeleton } from "~/components/ui/skeleton";

type ProjectDashboardCardsProps = {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectDashboardCards = ({ project }: ProjectDashboardCardsProps) => {
  return (
    <div className="flex flex-row justify-between gap-4">
      <TotalTasksCardSuspensed projectId={project.id} />
      <CompletionRateCard />
      <HighPriorityTasksCard />
      <TeamMembersCard />
    </div>
  );
};

const TotalTasksCardSuspensed = ({ projectId }: { projectId: string }) => {
  return (
    <Suspense
      fallback={
        <TotalTasksCard
          currentMonthTasksCount={null}
          previousMonthTasksCount={null}
        />
      }
    >
      <TotalTasksCardAsync projectId={projectId} />
    </Suspense>
  );
};

const TotalTasksCardAsync = async ({ projectId }: { projectId: string }) => {
  const { currentMonthTasksCount, previousMonthTasksCount } =
    await api.tasks.getTaskCount({ projectId });

  return (
    <TotalTasksCard
      currentMonthTasksCount={currentMonthTasksCount}
      previousMonthTasksCount={previousMonthTasksCount}
    />
  );
};

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
            <span className="text-sm text-gray-500">Total Tasks</span>
            {currentMonthTasksCount ? (
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

const CompletionRateCard = () => {
  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Total Tasks</span>
            <span className="text-2xl font-bold">63</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <Progress value={33} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const HighPriorityTasksCard = () => {
  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">High Priority</span>
            <span className="text-2xl font-bold">5</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
          <span className="font-medium text-red-500">3</span>
          <span className="ml-1 text-muted-foreground">
            need immediate attention
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const TeamMembersCard = () => {
  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Team Members</span>
            <span className="text-2xl font-bold">6</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="mt-4 flex -space-x-2">
          {new Array(6).fill(null).map((_u, index) => (
            <UserAvatar
              key={index}
              size="default"
              className="border-2 border-white"
              user={{
                firstName: "Jan",
                lastName: "Kowalski",
                email: "jan.kowalski@example.com",
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDashboardCards;
