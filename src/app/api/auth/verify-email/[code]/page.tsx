import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import EmailVerification from "./emailVerification";

export const metadata = {
  title: "Styran - Email verification",
};

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // const session = await auth();

  // if (session) {
  //   redirect("/");
  // }
  const code = (await params).code;

  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <EmailVerification code={code} />
    </main>
  );
}
