"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { type UserRouterOutputs } from "~/server/api/routers/user";
import { api } from "~/trpc/react";

import { useDebounce } from "~/hooks/useDebounce";

import { CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Collapse } from "~/components/ui/collapse";

type AccountPreferencesProps = {
  userInfo: UserRouterOutputs["getUserInfo"] & {
    discordId?: string | null;
    discordAccessToken?: string | null;
  };
};

const AccountPreferences = ({ userInfo }: AccountPreferencesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(Boolean(userInfo.discordWebhookUrl));
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(
    userInfo.discordWebhookUrl ?? "",
  );
  const { mutateAsync: updateUserInfo, isPending } =
    api.user.updateUserInfo.useMutation({ onSuccess: () => router.refresh() });
  const { mutateAsync: testWebhook } =
    api.integrations.testDiscordPersonalWebhook.useMutation();

  // Check for Discord connection success/failure messages
  useEffect(() => {
    if (searchParams.get("discord") === "connected") {
      toast.success("Discord account connected successfully!");
    }
    if (searchParams.get("error")) {
      toast.error(`Discord connection failed: ${searchParams.get("error")}`);
    }
  }, [searchParams]);

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setDiscordWebhookUrl("");
      if (userInfo.discordWebhookUrl) {
        debouncedSubmit(null);
      }
    }
  };

  const onDiscordWebhookUrlChange = (value: string | null) => {
    setDiscordWebhookUrl(value ?? "");
    return debouncedSubmit(value ?? "");
  };

  const debouncedSubmit = useDebounce((url: string | null) => {
    return updateUserInfo({ discordWebhookUrl: url });
  }, 300);

  const onTestClick = () => {
    return testWebhook().catch(() => {
      toast.error("Failed to test webhook");
    });
  };

  const isDiscordConnected = Boolean(userInfo.discordId);

  return (
    <>
      <CardHeader className="mb-1 text-lg font-bold">
        Notification Preferences
      </CardHeader>
      <CardDescription>
        Manage how you receive notifications here
      </CardDescription>
      <CardContent className="mt-6">
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Email notifications</div>
          <Switch disabled />
        </div>
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Push notifications</div>
          <Switch disabled />
        </div>
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Marketing emails</div>
          <Switch disabled />
        </div>

        <div className="flex flex-col gap-2 border-b py-4">
          <div className="flex justify-between gap-1">
            <div className="font-medium">Discord notifications</div>
            <Switch
              checked={open}
              onCheckedChange={onOpenChange}
              disabled={isPending}
            />
          </div>
          <Collapse isOpen={open}>
            <div className="flex flex-col items-end gap-2">
              <span className="w-full text-sm text-muted-foreground">
                You will be notified when you have new messages or tasks
                assigned to you and about high priority tasks with short
                deadlines.
              </span>
              <InputWithLabel
                label="Paste Discord channel webhook"
                value={discordWebhookUrl}
                disabled={isPending}
                placeholder="https://discord.com/api/webhooks/..."
                onChange={(e) => {
                  onDiscordWebhookUrlChange(e.currentTarget.value);
                }}
              />
              <Button
                onClick={onTestClick}
                disabled={isPending || !userInfo.discordWebhookUrl}
              >
                Test webhook
              </Button>
            </div>
          </Collapse>
        </div>

        <div className="flex flex-col gap-2 border-b py-4">
          <div className="flex justify-between gap-1">
            <div className="font-medium">Discord account</div>
            {isDiscordConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = "/api/discord/connect";
                }}
                disabled={isPending}
              >
                Connect Discord
              </Button>
            )}
          </div>
          <span className="w-full text-sm text-muted-foreground">
            Connect your Discord account to verify your identity and improve
            your user experience. This allows us to associate your Discord
            identity with your account.
          </span>
        </div>
      </CardContent>
    </>
  );
};

export { AccountPreferences };
