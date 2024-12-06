"use client";

import { redirect } from "next/navigation";

import { api } from "~/trpc/react";

import ProjectPageShell from "../projectPageShell";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import TaskList from "./tasksList";
import CurrentSprint from "./curentSprint";

type BacklogComponentProps = {
  id: string;
  userId: string;
};

const BacklogComponent = ({ id, userId }: BacklogComponentProps) => {
  const [project] = api.projects.getProject.useSuspenseQuery({ id });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId: id });

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell project={project} userId={userId}>
      <div className="flex flex-row gap-4">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost">Main</Button>
        </Link>

        <Button variant="default">Backlog</Button>

        <Link href={`/projects/${id}/users`}>
          <Button variant="ghost">Users</Button>
        </Link>
      </div>

      <div className="mx-4 my-8 flex w-full flex-col gap-6 overflow-hidden">
        <div className="overflow-y-auto">
          <CurrentSprint project={project} tasks={tasks} />

          <TaskList tasks={tasks} projectId={id} />
        </div>
      </div>
    </ProjectPageShell>
  );
};

export default BacklogComponent;
