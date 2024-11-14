"use client";

import { redirect } from "next/navigation";

import { api } from "~/trpc/react";

import ProjectDropdown from "./projectDropdown";

const ProjectComponent = ({ id, userId }: { id: string; userId: string }) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <div className="flex h-full flex-1 px-16 py-16 pt-32">
      <div>
        <div className="flex flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">{`[${project.ticker}] ${project.name}`}</h2>

          {project.ownerId === userId && <ProjectDropdown project={project} />}
        </div>

        <br />
        {JSON.stringify(project)}
      </div>
    </div>
  );
};

export default ProjectComponent;
