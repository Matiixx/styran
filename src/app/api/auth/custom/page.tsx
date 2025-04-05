import { CustomSignInForm } from "./CustomSignInForm";

export const metadata = {
  title: "Styran - Custom Login",
};

export default async function SignInPage() {
  return (
    <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
      <CustomSignInForm />
    </main>
  );
}
