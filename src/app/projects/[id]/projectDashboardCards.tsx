import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import { TaskCardsSuspended } from "./components/dashboard/taskCards";
import { HighPriorityTasksCardSuspended } from "./components/dashboard/HighPriorityTasksCard";
import { TeamMembersCardSuspended } from "./components/dashboard/TeamMembersCard";

type ProjectDashboardCardsProps = {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectDashboardCards = ({ project }: ProjectDashboardCardsProps) => {
  return (
    <div className="flex flex-row justify-between gap-4">
      <TaskCardsSuspended projectId={project.id} />
      <HighPriorityTasksCardSuspended projectId={project.id} />
      <TeamMembersCardSuspended projectId={project.id} />
    </div>
  );
};

export default ProjectDashboardCards;
