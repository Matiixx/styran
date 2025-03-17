"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";

const ResetSchema = z
  .object({
    password: z.string().min(3, "Password must be at least 3 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ResetForm = ({ code }: { code: string }) => {
  const { mutateAsync: resetPassword } = api.user.resetPassword.useMutation({
    onSuccess: () => {
      toast("Password reset");
      router.push("/api/auth/signin");
    },
    onError: () => {
      toast.error("Error resetting password");
    },
  });
  const router = useRouter();

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof ResetSchema>>({
    mode: "onTouched",
    resolver: zodResolver(ResetSchema),
  });

  const onSubmit = handleSubmit((data) =>
    resetPassword({ password: data.password, code }),
  );

  return (
    <Card className="w-full max-w-lg" disableHover>
      <CardHeader>
        <CardTitle>Set New Password</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex w-full flex-col gap-4">
          <InputWithLabel
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={!!errors.password}
            errorMessage={errors.password?.message}
            {...register("password")}
          />
          <InputWithLabel
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Link href="/api/auth/signin">
          <Button variant="outline">Back to login</Button>
        </Link>
        <Button onClick={onSubmit}>Reset Password</Button>
      </CardFooter>
    </Card>
  );
};
