"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";
import { api } from "~/trpc/react";

const ForgetSchema = z.object({
  email: z.string().email(),
});

export const ForgetForm = () => {
  const { mutateAsync: sendResetEmail } = api.user.sendResetEmail.useMutation({
    onSuccess: () => {
      toast("Reset link sent");
    },
    onError: () => {
      toast.error("Error sending reset link");
    },
  });

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof ForgetSchema>>({
    mode: "onTouched",
    resolver: zodResolver(ForgetSchema),
  });

  const onSubmit = handleSubmit((data) => {
    return sendResetEmail(data);
  });

  return (
    <Card className="w-full max-w-lg" disableHover>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex w-full flex-col gap-4">
          <InputWithLabel
            label="Email"
            type="email"
            placeholder="Email"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Link href="/api/auth/signin">
          <Button variant="outline">Back to login</Button>
        </Link>
        <Button onClick={onSubmit}>Send Reset Link</Button>
      </CardFooter>
    </Card>
  );
};
