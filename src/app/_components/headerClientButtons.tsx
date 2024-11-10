"use client";

import { type FC } from "react";
import { type Session } from "next-auth";
import Link from "next/link";

import { Button } from "~/components/ui/button";

type HeaderClientButtonsProps = {
  session: Session | null;
};

const HeaderClientButtons: FC<HeaderClientButtonsProps> = ({ session }) => {
  return (
    <div>
      {session?.user ? (
        <Link href="/api/auth/logout">
          <Button variant="ghostDesctructive">Logout</Button>
        </Link>
      ) : (
        <Link href="/api/auth/signin">
          <Button variant="ghost">Login</Button>
        </Link>
      )}
    </div>
  );
};

export default HeaderClientButtons;
