import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import ProjectDashboardCards from "./projectDashboardCards";

type ProjectDashboardProps = {
  project: ProjectRouterOutput["getProject"];
};

const ProjectDashboard = ({ project }: ProjectDashboardProps) => {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 bg-white p-4">
      <span className="text-2xl font-bold text-black">Project Dashboard</span>
      <ProjectDashboardCards project={project} />
    </div>
  );
};

export default ProjectDashboard;
