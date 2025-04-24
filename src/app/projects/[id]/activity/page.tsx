import { redirect } from "next/navigation";
import { type Metadata } from "next";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

import ProjectPageShell from "../projectPageShell";
import ActivityPage from "./ActivityPage";
import { type ActivityFiltersParams } from "./ActivityFilters";

export default async function ProjectPage({
  params,
  searchParams: _searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ActivityFiltersParams>;
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

  return (
    <ProjectPageShell userId={session.user.id} project={project}>
      <ActivityPage
        projectId={id}
        page={searchParams.page}
        searchParams={searchParams}
      />
    </ProjectPageShell>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const project = await api.projects.getProject({ id });

  return {
    title: `${project?.name ?? "Project"} - Activity Log`,
  };
}
