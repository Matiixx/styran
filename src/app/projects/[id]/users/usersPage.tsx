"use client";

import { redirect } from "next/navigation";
import { type Session } from "next-auth";

import { api } from "~/trpc/react";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

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
      <ProjectNavigationButtons id={projectId} />

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
