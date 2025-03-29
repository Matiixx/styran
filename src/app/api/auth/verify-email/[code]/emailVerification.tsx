"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { update } = useSession();
  const [verified, setVerified] = useState(false);

  const verify = () => {
    if (code) {
      return verifyEmail({ code })
        .then(({ email }) => {
          setVerified(true);
          toast("Email verified");
          return update({ email }).then(() => {
            router.refresh();
          });
        })
        .catch(() => toast.error("Email verification failed"));
    }
  };

  if (!verified && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div>Click the button below to verify your email</div>
        <Button onClick={verify}>Verify email</Button>
      </div>
    );
  }

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
