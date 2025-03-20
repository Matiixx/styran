"use client";

import { redirect } from "next/navigation";

import { api } from "~/trpc/react";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import ProjectPageShell from "./projectPageShell";
import ProjectDashboard from "./projectDashboard";

const ProjectComponent = ({ id, userId }: { id: string; userId: string }) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id });

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
