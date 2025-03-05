import { redirect } from "next/navigation";
import { type Metadata } from "next";

import { auth } from "~/server/auth";

import { api, HydrateClient } from "~/trpc/server";
import BoardComponent from "./boardComponent";

type BoardPageProps = {
  params: Promise<{ id: string }>;
};

async function BoardPage({ params }: BoardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const id = (await params).id;
  void api.projects.getProject.prefetch({ id });
  void api.tasks.getTasks.prefetch({ projectId: id });

  return (
    <HydrateClient>
      <BoardComponent userId={session.user.id} projectId={id} />
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
    title: `${project?.name ?? `Project`} - Board`,
  };
}

export default BoardPage;
