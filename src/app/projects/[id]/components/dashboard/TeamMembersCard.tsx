import { Suspense } from "react";

import { Users } from "lucide-react";
import size from "lodash/size";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";

import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type TeamMembersCardSuspendedProps = {
  projectId: string;
};

export const TeamMembersCardSuspended = ({
  projectId,
}: TeamMembersCardSuspendedProps) => {
  return (
    <Suspense fallback={<TeamMembersCard teamMembers={null} />}>
      <TeamMembersCardAsync projectId={projectId} />
    </Suspense>
  );
};

const TeamMembersCardAsync = async ({
  projectId,
}: TeamMembersCardSuspendedProps) => {
  const projectMembers = await api.projects.getProjectMembers({ projectId });

  return <TeamMembersCard teamMembers={projectMembers} />;
};

type TeamMembersCardProps = {
  teamMembers:
    | { id: string; firstName: string; lastName: string; email: string }[]
    | null;
};

export const TeamMembersCard = ({ teamMembers }: TeamMembersCardProps) => {
  const teamMembersCount = size(teamMembers);

  return (
    <Card disableHover className="w-full">
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500">Team Members</span>
            {teamMembers !== null ? (
              <span className="text-2xl font-bold">{teamMembersCount}</span>
            ) : (
              <Skeleton className="h-8 w-10" />
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="mt-4 flex -space-x-2">
          {teamMembers !== null ? (
            teamMembers
              .slice(0, 6)
              .map((member, index) => (
                <UserAvatar
                  key={member.id}
                  size="default"
                  user={member}
                  className={cn(
                    "border-2 border-white",
                    index !== 0 && "animate-avatar-spacing",
                  )}
                />
              ))
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
