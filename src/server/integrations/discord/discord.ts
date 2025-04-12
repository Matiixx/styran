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

export { sendDiscordMessage };
