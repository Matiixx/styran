import { Header } from "~/app/_components/header";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

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
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center">
        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
