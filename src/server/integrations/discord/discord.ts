const sendDiscordMessage = async (webhookUrl: string, message: string) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Styran", content: message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message to Discord");
  }
};

interface DiscordChannel {
  id: string;
  type: number;
  recipient_id: string;
}

interface DiscordMessage {
  id: string;
  channel_id: string;
  content: string;
}

const sendDiscordDirectMessage = async (
  userId: string,
  accessToken: string,
  message: string,
): Promise<DiscordMessage> => {
  // First create a DM channel
  const channelResponse = await fetch(
    "https://discord.com/api/v10/users/@me/channels",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: userId }),
    },
  );

  if (!channelResponse.ok) {
    throw new Error("Failed to create DM channel with Discord user");
  }

  const channel = (await channelResponse.json()) as DiscordChannel;

  // Then send message to that channel
  const messageResponse = await fetch(
    `https://discord.com/api/v10/channels/${channel.id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    },
  );

  if (!messageResponse.ok) {
    throw new Error("Failed to send direct message to Discord user");
  }

  return messageResponse.json() as Promise<DiscordMessage>;
};

export { sendDiscordMessage, sendDiscordDirectMessage };
