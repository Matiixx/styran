import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import { env } from "~/env";

const sendEmail = async (subject: string, html: string, to: string) => {
  const oauth2Client = new OAuth2Client({
    clientId: env.GMAIL_CLIENT_ID,
    clientSecret: env.GMAIL_CLIENT_SECRET,
  });
  oauth2Client.setCredentials({
    refresh_token: env.GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const message = {
    to,
    subject,
    html,
  };

  const encodedMessage = Buffer.from(
    `To: ${message.to}\r\n` +
      `Subject: ${message.subject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: multipart/alternative; boundary="boundary123"\r\n` +
      `\r\n` +
      `--boundary123\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n` +
      `\r\n` +
      `${message.html}\r\n` +
      `\r\n` +
      `--boundary123--`,
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log("Email sent successfully:", res.data);
    return res;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export { sendEmail };
