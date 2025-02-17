import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { ResetForm } from "./resetForm";

export const metadata = {
  title: "Styran - Reset Password",
};

export default async function ResetPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <ResetForm code={(await params).code} />
    </main>
  );
}
