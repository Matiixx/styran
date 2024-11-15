"use client";

import { redirect } from "next/navigation";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

import Link from "next/link";
import ProjectPageShell from "./projectPageShell";

const ProjectComponent = ({ id, userId }: { id: string; userId: string }) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <div className="flex flex-row gap-4">
        <Button variant="default">Main</Button>

        <Link href={`/projects/${id}/users`}>
          <Button variant="ghost">Users</Button>
        </Link>
      </div>

      {JSON.stringify(project)}
    </ProjectPageShell>
  );
};

export default ProjectComponent;
