import { redirect } from "next/navigation";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/server/auth";

import { SignOutButtons } from "./signOutButtons";

export const metadata = {
  title: "Styran - Sign Out",
};

export default async function SignOutPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <Card className="w-full max-w-lg" disableHover>
        <CardHeader>
          <CardTitle>Logout</CardTitle>
          <CardDescription>Are you sure you want to logout?</CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-end gap-2">
          <SignOutButtons />
        </CardFooter>
      </Card>
    </main>
  );
}
