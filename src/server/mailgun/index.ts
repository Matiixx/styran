import { MailtrapClient } from "mailtrap";

import { env } from "~/env";

const sendEmail = async (subject: string, text: string) => {
  const client = new MailtrapClient({ token: env.MAILTRAP_API_TOKEN });

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Mailtrap Test",
  };
  const recipients = [{ email: "mateuszcichostepski@gmail.com" }];

  return client.send({ from: sender, to: recipients, subject, text });
};

export { sendEmail };
