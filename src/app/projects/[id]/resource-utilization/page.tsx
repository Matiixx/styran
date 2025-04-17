import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

import ResourceUtilization from "./resourceUtilization";
import ProjectPageShell from "../projectPageShell";
import { ResourceUtilizationDuration } from "~/lib/resourceUtilization/durations";

export default async function ProjectPage({
  params,
  searchParams: _searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
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

  const searchParams = await _searchParams;

  if (
    !searchParams.tab ||
    !Object.values(ResourceUtilizationDuration).includes(
      searchParams.tab as ResourceUtilizationDuration,
    )
  ) {
    redirect(
      `/projects/${id}/resource-utilization?tab=${ResourceUtilizationDuration.WEEK}`,
    );
  }

  return (
    <ProjectPageShell userId={session.user.id} project={project}>
      <ResourceUtilization
        duration={searchParams.tab as ResourceUtilizationDuration}
        project={project}
      />
    </ProjectPageShell>
  );
}
