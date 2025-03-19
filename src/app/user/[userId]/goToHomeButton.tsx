"use client";

import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";

export const GoToHomeButton = () => {
  const router = useRouter();

  return <Button onClick={() => router.push("/")}>Go to Home</Button>;
};
