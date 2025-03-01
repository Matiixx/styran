import SendGrid from "@sendgrid/mail";

import { env } from "~/env";

const sendEmail = async (subject: string, html: string, to: string) => {
  SendGrid.setApiKey(env.SENDGRID_API_KEY);

  const msg = {
    from: env.SENDGRID_FROM_EMAIL,
    to,
    html,
    subject,
  } satisfies SendGrid.MailDataRequired;

  const response = await SendGrid.send(msg);
  return response;
};

export { sendEmail };
