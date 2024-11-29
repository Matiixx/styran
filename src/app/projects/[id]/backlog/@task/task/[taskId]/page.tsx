import { api } from "~/trpc/server";

import TaskDrawer from "../../(.)task/[taskId]/taskDrawer";

export default async function ParallelRoutePage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  void api.tasks.getTask.prefetch({ projectId: id, taskId });

  return <TaskDrawer taskId={taskId} projectId={id} />;
}
