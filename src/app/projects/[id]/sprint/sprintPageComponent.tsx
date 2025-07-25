import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

import ProjectPageShell from "../projectPageShell";
import SprintTabs from "./sprintTabs";

type SprintPageComponentProps = {
  id: string;
  userId: string;
};

const SprintPageComponent = async ({
  id,
  userId,
}: SprintPageComponentProps) => {
  const project = await api.projects.getProjectSettings({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <div className="flex w-full flex-col gap-6 overflow-visible">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <span className="text-2xl font-bold text-black">
            Sprint Management
          </span>
        </div>
        <SprintTabs projectId={id} />
      </div>
    </ProjectPageShell>
  );
};

export default SprintPageComponent;
