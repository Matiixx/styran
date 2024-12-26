import { useMemo } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";

type ProjectNavigationButtonsProps = {
  id: string;
};

export default function ProjectNavigationButtons({
  id,
}: ProjectNavigationButtonsProps) {
  const pathname = usePathname();

  const isActive = useMemo(() => {
    return (path: string) => pathname === path;
  }, [pathname]);

  return (
    <div className="flex flex-row gap-4">
      <Link href={`/projects/${id}`}>
        <Button variant={isActive(`/projects/${id}`) ? "default" : "ghost"}>
          Main
        </Button>
      </Link>

      <Link href={`/projects/${id}/backlog`}>
        <Button
          variant={isActive(`/projects/${id}/backlog`) ? "default" : "ghost"}
        >
          Backlog
        </Button>
      </Link>

      <Link href={`/projects/${id}/board`}>
        <Button
          variant={isActive(`/projects/${id}/board`) ? "default" : "ghost"}
        >
          Board
        </Button>
      </Link>

      <Link href={`/projects/${id}/users`}>
        <Button
          variant={isActive(`/projects/${id}/users`) ? "default" : "ghost"}
        >
          Users
        </Button>
      </Link>

      <Link href={`/projects/${id}/calendar`}>
        <Button
          variant={isActive(`/projects/${id}/calendar`) ? "default" : "ghost"}
        >
          Calendar
        </Button>
      </Link>
    </div>
  );
}
