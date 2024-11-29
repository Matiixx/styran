import { api, HydrateClient } from "~/trpc/server";

export default async function BacklogLayout({
  task,
  params,
  children,
}: Readonly<{
  task: React.ReactNode;
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}>) {
  const id = (await params).id;
  void api.projects.getProject.prefetch({ id });
  void api.tasks.getTasks.prefetch({ projectId: id });

  return (
    <HydrateClient>
      {children}
      {task}
    </HydrateClient>
  );
}
