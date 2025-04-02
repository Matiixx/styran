import { useMemo } from "react";
import { CircleUser } from "lucide-react";

import map from "lodash/map";

import {
  Avatar,
  AvatarFallback,
  type AvatarProps,
} from "~/components/ui/avatar";
import { stringToRGB } from "~/app/projects/[id]/calendar/utils";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { cn } from "~/lib/utils";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

export const getUserInitials = (user: Pick<User, "firstName" | "lastName">) => {
  return (
    user.firstName.charAt(0)?.toUpperCase() +
    user.lastName.charAt(0)?.toUpperCase()
  );
};

export type UserAvatarProps = {
  user?: Pick<User, "email" | "firstName" | "lastName"> | null;
  className?: string;
  showUnassigned?: boolean;
} & AvatarProps;

export function UserAvatar({
  user,
  size,
  className,
  showUnassigned = true,
}: UserAvatarProps) {
  const { background, foreground } = useMemo(
    () => stringToRGB(user?.email ?? ""),
    [user?.email],
  );

  if (!user && showUnassigned) {
    return (
      <Avatar size={size} className={className}>
        <AvatarFallback>
          <CircleUser />
        </AvatarFallback>
      </Avatar>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        style={{ backgroundColor: background, color: foreground }}
      >
        {getUserInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}

export const AvatarGroup = ({
  users,
}: {
  users: {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
  }[];
}) => {
  return (
    <div className="flex -space-x-2">
      {map(users, (member, index) => (
        <UserAvatar
          key={member.id}
          size="default"
          user={member}
          className={cn(
            "border-2 border-white",
            index !== 0 && "animate-avatar-spacing",
          )}
        />
      ))}
    </div>
  );
};
