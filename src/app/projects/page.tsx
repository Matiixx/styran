import { redirect } from "next/navigation";

import { api, HydrateClient } from "~/trpc/server";
import { Header } from "../_components/header";
import { auth } from "~/server/auth";

import ProjectsComponent from "./projects";

export const metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const session = await auth();

  if (session) {
    void api.projects.getProjects.prefetch();
    void api.tasks.getProjectsTasksStats.prefetch();
  }

  if (!session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <ProjectsComponent />
        </div>
      </div>
    </HydrateClient>
  );
}
