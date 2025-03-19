"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";
import { type UserRouterOutputs } from "~/server/api/routers/user";

import { Button } from "~/components/ui/button";
import { CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type AccountInfoProps = {
  userInfo: UserRouterOutputs["getUserInfo"];
};

const AccountInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
});

const AccountInfoOptionalSchema = AccountInfoSchema.partial();

const getDefaultValues = (userInfo: UserRouterOutputs["getUserInfo"]) => {
  return {
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    email: userInfo.email,
    bio: userInfo.bio ?? "",
  };
};
const AccountInfo = ({ userInfo }: AccountInfoProps) => {
  const router = useRouter();
  const utils = api.useUtils();
  const { mutateAsync: updateUserInfo } = api.user.updateUserInfo.useMutation({
    onSuccess: () => {
      router.refresh();
      return utils.user.getUserInfo.invalidate({ userId: userInfo.id });
    },
  });

  const { register, handleSubmit } = useForm({
    mode: "onBlur",
    defaultValues: getDefaultValues(userInfo),
    resolver: zodResolver(AccountInfoSchema),
  });

  const onSubmit = handleSubmit((data) => {
    const changes: z.infer<typeof AccountInfoOptionalSchema> = {};

    if (data.firstName !== userInfo.firstName)
      changes.firstName = data.firstName;
    if (data.lastName !== userInfo.lastName) changes.lastName = data.lastName;
    if (data.email !== userInfo.email) {
      toast.warning("You need to verify email to change it");
      changes.email = data.email;
    }
    if (data.bio !== userInfo.bio) changes.bio = data.bio;

    if (Object.keys(changes).length === 0) {
      return toast("No changes to save");
    }

    const validatedChanges = AccountInfoOptionalSchema.parse(changes);
    return updateUserInfo(validatedChanges)
      .then(() => toast("Account information updated successfully"))
      .catch(() => toast.error("Failed to update account information"));
  });

  return (
    <>
      <CardHeader className="mb-1 text-xl font-bold">
        Account Information
      </CardHeader>
      <CardDescription>Update your personal information here</CardDescription>

      <CardContent className="mt-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input {...register("firstName")} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register("lastName")} />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register("email")} />
          </div>
          <div>
            <Label>Bio</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border p-2"
              placeholder="Tell us about yourself"
              {...register("bio")}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onSubmit}>Save Changes</Button>
        </div>
      </CardContent>
    </>
  );
};

export { AccountInfo };
