import type { DiscordEmbed, DiscordWebhookPayload } from "./discord.d";

const sendDiscordMessage = async (
  webhookUrl: string,
  message: string,
  embeds?: DiscordEmbed[],
  options?: Partial<Omit<DiscordWebhookPayload, "content" | "embeds">>,
) => {
  const payload: DiscordWebhookPayload = {
    username: "Styran",
    content: message,
    embeds: embeds ?? [],
    ...options,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send message to Discord");
  }
};

export { sendDiscordMessage };
