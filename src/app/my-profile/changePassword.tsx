"use client";

import { useState, type FC } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { CardDescription, CardHeader } from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";
import { api } from "~/trpc/react";

const ChangePassword: FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const { mutateAsync: changePassword } = api.user.changePassword.useMutation();

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return;
    }
    if (newPassword !== confirmNewPassword) {
      return;
    }
    return changePassword({ oldPassword, newPassword })
      .then(() => toast("Password changed"))
      .catch(() => toast.error("There was an error changing your password"));
  };

  return (
    <>
      <CardHeader className="mb-1 text-lg font-bold">
        Change Password
      </CardHeader>
      <CardDescription>
        Update your password to keep your account secure
      </CardDescription>
      <div className="mt-6 flex w-full flex-col gap-4 rounded-xl">
        <InputWithLabel
          label="Old Password"
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <InputWithLabel
          label="New Password"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <InputWithLabel
          label="Confirm New Password"
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleChangePassword}>Change password</Button>
      </div>
    </>
  );
};

export { ChangePassword };
