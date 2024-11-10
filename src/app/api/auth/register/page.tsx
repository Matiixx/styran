import { Header } from "~/app/_components/header";

import { RegisterForm } from "./registerForm";

export const metadata = {
  title: "Styran - Register",
};

const RegisterPage = () => {
  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <Header />
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;
