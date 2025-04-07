import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import ResourceUtilization from "./resourceUtilization";
import ProjectPageShell from "../projectPageShell";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const id = (await params).id;
  const project = await api.projects.getProject({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={session.user.id} project={project}>
      <ProjectNavigationButtons id={id} />

      <ResourceUtilization project={project} />
    </ProjectPageShell>
  );
}
