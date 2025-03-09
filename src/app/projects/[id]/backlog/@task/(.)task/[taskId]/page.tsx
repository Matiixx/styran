import { api, HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";

import TaskDrawer from "./taskDrawer";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const session = await auth();

  void api.tasks.getTask.prefetch({ projectId: id, taskId });
  void api.taskComments.getComments.prefetch({ projectId: id, taskId });

  return (
    <HydrateClient>
      <TaskDrawer userId={session!.user.id} taskId={taskId} projectId={id} />
    </HydrateClient>
  );
}
