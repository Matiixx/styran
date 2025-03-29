import { SessionProvider } from "next-auth/react";

import EmailVerification from "./emailVerification";

export const metadata = {
  title: "Styran - Email verification",
};

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const code = (await params).code;

  return (
    <SessionProvider>
      <main className="bg-gradient-background flex min-h-screen flex-col items-center justify-center">
        <EmailVerification code={code} />
      </main>
    </SessionProvider>
  );
}
