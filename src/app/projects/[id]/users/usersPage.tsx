"use client";

import Link from "next/link";
import { redirect } from "next/navigation";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

import ProjectPageShell from "../projectPageShell";
import UsersList from "./usersList";

type UsersProjectComponentProps = {
  userId: string;
  projectId: string;
};

const UsersProjectComponent = ({
  userId,
  projectId,
}: UsersProjectComponentProps) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <div className="flex flex-row gap-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost">Main</Button>
        </Link>

        <Button variant="default">Users</Button>
      </div>

      <UsersList users={project.users} />
    </ProjectPageShell>
  );
};

export default UsersProjectComponent;
