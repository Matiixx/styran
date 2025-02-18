"use client";

import { useState, type FC } from "react";

import { Button } from "~/components/ui/button";
import { InputWithLabel } from "~/components/ui/input";
import { api } from "~/trpc/react";

const ChangePassword: FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [result, setResult] = useState<{ success?: string; error?: string }>(
    {},
  );

  const { mutateAsync: changePassword } = api.user.changePassword.useMutation();

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return;
    }
    if (newPassword !== confirmNewPassword) {
      return;
    }
    return changePassword({ oldPassword, newPassword })
      .then(() => {
        setResult({ success: "Password changed" });
      })
      .catch(() => {
        setResult({ error: "There was an error changing your password" });
      });
  };

  return (
    <div className="my-4 flex w-1/2 flex-col gap-4 rounded-xl border border-gray-300 p-4">
      <h3 className="text-lg font-bold">Change Password</h3>
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
      <Button onClick={handleChangePassword}>Change password</Button>
      {result.success && <p className="text-sm">{result.success}</p>}
      {result.error && <p className="text-sm text-red-500">{result.error}</p>}
    </div>
  );
};

export { ChangePassword };
