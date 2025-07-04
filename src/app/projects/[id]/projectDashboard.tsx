import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import ProjectDashboardCards from "./projectDashboardCards";
import ProjectActivityOverview from "./projectActivityOverview";
import ProjectTaskStatusCard from "./projectTaskStatusCard";
import ProjectTaskPriorityCard from "./projectTaskPriorityCard";
import ProjectTaskUsersCard from "./projectTaskUsersCard";
import ProjectResourceUtilization from "./projectResourceUtilization";
import ProjectLastActivity from "./projectLastActivity";

type ProjectDashboardProps = {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectDashboard = ({ project }: ProjectDashboardProps) => {
  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <span className="text-2xl font-bold text-black">Project Dashboard</span>
      <ProjectDashboardCards project={project} />
      <ProjectActivityOverview projectId={project.id} />
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <ProjectTaskStatusCard projectId={project?.id ?? ""} />
        <ProjectTaskPriorityCard projectId={project?.id ?? ""} />
        <ProjectTaskUsersCard projectId={project?.id ?? ""} />
      </div>
      <ProjectResourceUtilization projectId={project?.id ?? ""} />
      <ProjectLastActivity projectId={project?.id ?? ""} />
    </div>
  );
};

export default ProjectDashboard;
