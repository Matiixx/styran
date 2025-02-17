import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { ForgetForm } from "./forgetForm";

export const metadata = {
  title: "Styran - Forget Password",
};

export default async function ForgetPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <ForgetForm />
    </main>
  );
}
