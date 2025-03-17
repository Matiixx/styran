"use client";
import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

type EmailVerificationProps = {
  code: string;
};

const EmailVerification = ({ code }: EmailVerificationProps) => {
  const router = useRouter();
  const {
    mutateAsync: verifyEmail,
    isPending,
    isSuccess,
  } = api.user.verifyEmail.useMutation();

  useEffect(() => {
    if (code) {
      void verifyEmail({ code })
        .then(() => toast("Email verified"))
        .catch(() => toast.error("Email verification failed"));
    }
  }, [code, verifyEmail]);

  return (
    <div>
      {isPending ? (
        <div>Verifying email...</div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4">
          Email verified
          <Button onClick={() => router.push("/")}>Go to home</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          Email verification failed
          <Button onClick={() => router.push("/")}>Go to home</Button>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
