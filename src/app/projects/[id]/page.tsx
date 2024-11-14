import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "~/app/_components/header";

import ProjectComponent from "./projectComponent";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const id = (await params).id;
  void api.projects.getProject.prefetch({ id });

  return (
    <HydrateClient>
      <main className="bg-gradient-background flex h-screen flex-col items-center justify-center">
        <Header />
        <ProjectComponent id={id} userId={session.user.id} />
      </main>
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
