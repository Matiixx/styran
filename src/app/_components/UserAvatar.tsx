import { useMemo } from "react";
import { CircleUser } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  type AvatarProps,
} from "~/components/ui/avatar";
import { stringToRGB } from "~/app/projects/[id]/calendar/utils";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

export const getUserInitials = (user: User) => {
  return (
    user.firstName.charAt(0)?.toUpperCase() +
    user.lastName.charAt(0)?.toUpperCase()
  );
};

export type UserAvatarProps = {
  user?: User;
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
