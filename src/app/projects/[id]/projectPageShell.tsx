import { type PropsWithChildren } from "react";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import ProjectSidebar from "~/app/_components/projectSidebar";

type ProjectPageShellProps = PropsWithChildren<{
  userId: string;
  project: NonNullable<ProjectRouterOutput["getProject"]>;
}>;

const ProjectPageShell = ({
  userId,
  project,
  children,
}: ProjectPageShellProps) => {
  return (
    <div className="flex h-full w-full flex-1 flex-row overflow-y-auto pr-12 pt-28">
      <ProjectSidebar userId={userId} project={project} />
      <div className="flex h-full w-full flex-1 flex-col pb-4">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProjectPageShell;
