import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { RegisterForm } from "./registerForm";

export const metadata = {
  title: "Styran - Register",
};

const RegisterPage = async () => {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="bg-gradient-background flex min-h-screen items-center justify-center">
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;
