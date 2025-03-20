import { type ProjectRouterOutput } from "~/server/api/routers/projects/projects";
import ProjectDashboardCards from "./projectDashboardCards";
import ProjectActivityOverview from "./projectActivityOverview";

type ProjectDashboardProps = {
  project: ProjectRouterOutput["getProject"];
};

const ProjectDashboard = ({ project }: ProjectDashboardProps) => {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 overflow-y-auto bg-white p-4">
      <span className="text-2xl font-bold text-black">Project Dashboard</span>
      <ProjectDashboardCards project={project} />
      <ProjectActivityOverview />
    </div>
  );
};

export default ProjectDashboard;
