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
  }

  if (!session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <main className="bg-gradient-background flex h-screen flex-col items-center justify-center">
        <Header />

        <ProjectsComponent />
      </main>
    </HydrateClient>
  );
}
