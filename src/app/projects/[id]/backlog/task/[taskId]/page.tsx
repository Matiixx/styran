import { BacklogPageComponent } from "../../page";

export default async function Task({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  return <BacklogPageComponent params={params} />;
}
