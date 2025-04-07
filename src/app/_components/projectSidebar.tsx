"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import ProjectDropdown from "../projects/[id]/projectDropdown";

type ProjectSidebarProps = {
  userId: string;
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectSidebar = ({ userId, project }: ProjectSidebarProps) => {
  const pathname = usePathname();

  const isActive = useMemo(() => {
    return (path: string, exact = true) =>
      exact ? pathname === path : pathname.startsWith(path);
  }, [pathname]);

  return (
    <div className="sticky top-0 flex w-[250px] flex-col border border-gray-200 bg-gray-50 p-4">
      <div className="w-full text-center text-lg font-bold">
        [{project.ticker}]
      </div>
      <div className="w-full text-center text-xl font-bold">{project.name}</div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-1">
        <Link href={`/projects/${project.id}`}>
          <Button
            variant={isActive(`/projects/${project.id}`) ? "default" : "ghost"}
            fullWidth
            className="justify-start"
          >
            Dashboard
          </Button>
        </Link>

        <Link href={`/projects/${project.id}/backlog`}>
          <Button
            variant={
              isActive(`/projects/${project.id}/backlog`) ? "default" : "ghost"
            }
            fullWidth
            className="justify-start"
          >
            Backlog
          </Button>
        </Link>

        <Link href={`/projects/${project.id}/board`}>
          <Button
            variant={
              isActive(`/projects/${project.id}/board`) ? "default" : "ghost"
            }
            fullWidth
            className="justify-start"
          >
            Board
          </Button>
        </Link>

        <Link href={`/projects/${project.id}/users`}>
          <Button
            variant={
              isActive(`/projects/${project.id}/users`) ? "default" : "ghost"
            }
            fullWidth
            className="justify-start"
          >
            Users
          </Button>
        </Link>

        <Link href={`/projects/${project.id}/calendar`}>
          <Button
            variant={
              isActive(`/projects/${project.id}/calendar`) ? "default" : "ghost"
            }
            fullWidth
            className="justify-start"
          >
            Calendar
          </Button>
        </Link>

        <Link href={`/projects/${project.id}/resource-utilization`}>
          <Button
            variant={
              isActive(`/projects/${project.id}/resource-utilization`)
                ? "default"
                : "ghost"
            }
            fullWidth
            className="justify-start"
          >
            Resource Utilization
          </Button>
        </Link>

        <Separator className="my-4" />

        {userId === project.ownerId && <ProjectDropdown project={project} />}
      </div>
    </div>
  );
};

export default ProjectSidebar;
