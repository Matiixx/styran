"use client";

import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const ProjectComponent = ({ id }: { id: string }) => {
  const utils = api.useUtils();
  const [project] = api.projects.getProject.useSuspenseQuery({ id });

  const { mutate: editProject } = api.projects.editProject.useMutation({
    onSuccess: () => {
      return utils.projects.getProject.invalidate();
    },
  });

  if (!project) {
    redirect("/projects");
  }

  const onEditName = () => {
    return editProject({ id: project.id, name: "Project name 2" });
  };

  return (
    <div className="flex h-full flex-1 px-16 py-16 pt-32">
      <div>
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-2xl font-bold">{project.name}</h2>

          <Button onClick={onEditName}>Edit name</Button>
        </div>

        <br />
        {JSON.stringify(project)}
      </div>
    </div>
  );
};

export default ProjectComponent;
