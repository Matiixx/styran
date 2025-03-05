import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

import ProjectComponent from "./projectComponent";

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
  void api.projects.getProject.prefetch({ id });

  return (
    <HydrateClient>
      <ProjectComponent id={id} userId={session.user.id} />
    </HydrateClient>
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
    title: project?.name ?? `Project`,
  };
}
