const emailVerificationTemplate = (urlWithCode: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header a {
        color: #2563EB;
        font-size: 28px;
        text-decoration: none;
        font-weight: bold;
      }
      .content {
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background-color: #2563EB;
        color: white;
        font-weight: bold;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        margin: 20px 0;
      }
      .plain-url {
        word-break: break-all;
        color: #2563EB;
        font-size: 14px;
      }
      .footer {
        font-size: 12px;
        color: #6B7280;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <a href="http://localhost:3000">Styran</a>
    </div>
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Please verify your email address by clicking the button below. This link will expire in <strong>24 hours</strong>.</p>
      <div style="text-align: center;">
        <a href="${urlWithCode}" class="btn">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p class="plain-url">${urlWithCode}</p>
      <p>If you didn't request this email verification, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Styran. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
};

export { emailVerificationTemplate };
