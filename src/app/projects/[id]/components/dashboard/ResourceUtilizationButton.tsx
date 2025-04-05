"use client";

import Link from "next/link";

import { Button } from "~/components/ui/button";

export default function ResourceUtilizationButton({
  projectId,
}: {
  projectId: string;
}) {
  return (
    <Link href={`/projects/${projectId}/resource-utilization`}>
      <Button variant="outline" className="mt-4 w-full">
        View more
      </Button>
    </Link>
  );
}
