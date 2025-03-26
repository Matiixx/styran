import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import ProjectPageShell from "./projectPageShell";
import ProjectDashboard from "./projectDashboard";

const ProjectComponent = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  const project = await api.projects.getProject({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <ProjectNavigationButtons id={id} />

      <ProjectDashboard project={project} />
    </ProjectPageShell>
  );
};

export default ProjectComponent;
