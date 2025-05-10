"use client";

import { type FC } from "react";
import { type Session } from "next-auth";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";

type HeaderClientButtonsProps = {
  session: Session | null;
};

const HeaderClientButtons: FC<HeaderClientButtonsProps> = ({ session }) => {
  return (
    <div className="ml-8 flex w-full items-center justify-between">
      <div>
        <Link href="/projects">
          <Button variant="ghost">Projects</Button>
        </Link>
        <Link href="/my-profile">
          <Button variant="ghost">My Profile</Button>
        </Link>
      </div>
      <div>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              {/* @ts-expect-error: UserAvatar expects additional props */}
              <UserAvatar user={session.user} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2">
              <DropdownMenuItem>
                <Link href="/my-profile">My profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-600">
                <Link href="/api/auth/logout">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/api/auth/signin">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeaderClientButtons;
