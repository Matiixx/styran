"use client";

import Link from "next/link";

import map from "lodash/map";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AcivityCard, ActivityCardSkeleton } from "./activity/ActivityRows";

type ProjectLastActivityProps = {
  projectId: string;
};

export default function ProjectLastActivity({
  projectId,
}: ProjectLastActivityProps) {
  const { data: activityLogs, isLoading } =
    api.projects.getLastActivity.useQuery({
      projectId,
    });

  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent activity in the project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </>
          ) : (
            map(activityLogs, (activity) => (
              <AcivityCard key={activity.id} activity={activity} />
            ))
          )}
        </div>

        <Link href={`/projects/${projectId}/activity`}>
          <Button variant="outline" className="mt-4 w-full">
            View more
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
