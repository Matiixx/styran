import { redirect } from "next/navigation";

import { Header } from "~/app/_components/header";
import { auth } from "~/server/auth";

import { SignInForm } from "./signinForm";

export const metadata = {
  title: "Styran - Sign In",
};

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/");
    return null;
  }

  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <Header />
      <SignInForm />
    </main>
  );
}
