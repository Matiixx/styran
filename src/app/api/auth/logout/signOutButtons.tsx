"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "~/components/ui/button";

const SignOutButtons = () => {
  const router = useRouter();

  const handleLogout = () => {
    return signOut({ redirect: false })
      .then(() => router.push("/"))
      .catch(console.warn);
  };

  return (
    <>
      <Button variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );
};

export { SignOutButtons };
