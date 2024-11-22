import TaskDrawer from "../../(.)task/[taskId]/taskDrawer";

export default async function ParallelRoutePage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  return <TaskDrawer taskId={taskId} projectId={id} />;
}
