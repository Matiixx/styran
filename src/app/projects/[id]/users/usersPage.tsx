"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { type Session } from "next-auth";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

import ProjectPageShell from "../projectPageShell";
import UsersList from "./usersList";

type UsersProjectComponentProps = {
  user: Session["user"];
  projectId: string;
};

const UsersProjectComponent = ({
  user,
  projectId,
}: UsersProjectComponentProps) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={user.id} project={project}>
      <div className="flex flex-row gap-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost">Main</Button>
        </Link>

        <Button variant="default">Users</Button>
      </div>

      <UsersList
        users={[
          {
            ...user,
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
          },
          ...project.users,
        ]}
        project={project}
      />
    </ProjectPageShell>
  );
};

export default UsersProjectComponent;
