import { api } from "~/trpc/server";

import TaskDrawer from "./taskDrawer";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  void api.tasks.getTask.prefetch({ projectId: id, taskId });
  void api.taskComments.getComments.prefetch({ projectId: id, taskId });

  return <TaskDrawer taskId={taskId} projectId={id} />;
}
