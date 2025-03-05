import { redirect } from "next/navigation";
import { type Metadata } from "next";

import { auth } from "~/server/auth";

import UsersProjectComponent from "./usersPage";
import { api, HydrateClient } from "~/trpc/server";

type UsersProjectPageProps = {
  params: Promise<{ id: string }>;
};

async function UsersProjectPage({ params }: UsersProjectPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  void api.projects.getProject.prefetch({ id });

  return (
    <HydrateClient>
      <UsersProjectComponent user={session.user} projectId={id} />
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
    title: `${project?.name ?? `Project`} - Users`,
  };
}

export default UsersProjectPage;
