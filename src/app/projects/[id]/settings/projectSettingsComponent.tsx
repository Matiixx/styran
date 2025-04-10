import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import ProjectPageShell from "../projectPageShell";
import ProjectSettingsForm from "./projectSettingsForm";

type ProjectSettingsComponentProps = {
  id: string;
  userId: string;
};

const ProjectSettingsComponent = async ({
  id,
  userId,
}: ProjectSettingsComponentProps) => {
  const project = await api.projects.getProjectSettings({ id });

  if (!project) {
    return <div>Project not found</div>;
  }

  if (project.ownerId !== userId) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <div className="flex w-full flex-col gap-6 overflow-visible">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <span className="text-2xl font-bold text-black">Settings</span>
        </div>
        <ProjectSettingsForm project={project} />
      </div>
    </ProjectPageShell>
  );
};

export default ProjectSettingsComponent;
