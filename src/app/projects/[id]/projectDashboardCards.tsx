import { Users } from "lucide-react";

import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";
import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import { TaskCardsSuspended } from "./components/dashboard/taskCards";
import { HighPriorityTasksCardSuspended } from "./components/dashboard/HighPriorityTasksCard";

type ProjectDashboardCardsProps = {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectDashboardCards = ({ project }: ProjectDashboardCardsProps) => {
  return (
    <div className="flex flex-row justify-between gap-4">
      <TaskCardsSuspended projectId={project.id} />
      <HighPriorityTasksCardSuspended projectId={project.id} />
      <TeamMembersCard />
    </div>
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
