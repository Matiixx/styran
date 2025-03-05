import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

import BacklogComponent from "./backlogComponent";

export default async function _BacklogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BacklogPage params={params} />;
}

export async function BacklogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const id = (await params).id;

  return <BacklogComponent id={id} userId={session.user.id} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const project = await api.projects.getProject({ id });

  return {
    title: `${project?.name ?? `Project`} - Backlog`,
  };
}
