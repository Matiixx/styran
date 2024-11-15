import { type PropsWithChildren } from "react";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import ProjectDropdown from "./projectDropdown";

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
    <div className="flex h-full w-full flex-1 flex-col px-16 py-16 pt-32">
      <div className="flex w-full flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{`[${project.ticker}] ${project.name}`}</h2>

        {project.ownerId === userId && <ProjectDropdown project={project} />}
      </div>

      {children}
    </div>
  );
};

export default ProjectPageShell;
