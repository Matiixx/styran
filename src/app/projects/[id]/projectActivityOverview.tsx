import { Card } from "~/components/ui/card";
import ProjectActivityOverviewClient from "./components/dashboard/ProjectActivityOverviewClient";

type ProjectActivityOverviewProps = {
  projectId: string;
};

const ProjectActivityOverview = ({
  projectId,
}: ProjectActivityOverviewProps) => {
  return (
    <Card disableHover>
      <ProjectActivityOverviewClient projectId={projectId} />
    </Card>
  );
};

export default ProjectActivityOverview;
