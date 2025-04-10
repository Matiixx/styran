"use client";

import { type FC } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { CardDescription, CardHeader } from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";
import { api } from "~/trpc/react";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(5, "New password must be at least 5 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ChangePassword: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { mutateAsync: changePassword } = api.user.changePassword.useMutation();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast("Password changed successfully");
      reset();
    } catch {
      toast.error("There was an error changing your password");
    }
  });

  return (
    <>
      <CardHeader className="mb-1 text-lg font-bold">
        Change Password
      </CardHeader>
      <CardDescription>
        Update your password to keep your account secure
      </CardDescription>
      <form
        onSubmit={onSubmit}
        className="mt-6 flex w-full flex-col gap-4 rounded-xl"
      >
        <InputWithLabel
          label="Old Password"
          type="password"
          placeholder="Old Password"
          {...register("oldPassword")}
          error={!!errors.oldPassword?.message}
          errorMessage={errors.oldPassword?.message}
        />
        <InputWithLabel
          label="New Password"
          type="password"
          placeholder="New Password"
          {...register("newPassword")}
          error={!!errors.newPassword?.message}
          errorMessage={errors.newPassword?.message}
        />
        <InputWithLabel
          label="Confirm New Password"
          type="password"
          placeholder="Confirm New Password"
          {...register("confirmNewPassword")}
          error={!!errors.confirmNewPassword?.message}
          errorMessage={errors.confirmNewPassword?.message}
        />
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change password"}
          </Button>
        </div>
      </form>
    </>
  );
};

export { ChangePassword };
