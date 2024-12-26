"use client";

import { redirect } from "next/navigation";

import { api } from "~/trpc/react";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import ProjectPageShell from "./projectPageShell";

const ProjectComponent = ({ id, userId }: { id: string; userId: string }) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <ProjectNavigationButtons id={id} />

      {JSON.stringify(project)}
    </ProjectPageShell>
  );
};

export default ProjectComponent;
