const inviteUserEmailTemplate = (tempPassword: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to Styran</title>
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
      .password-box {
        background-color: #e5e7eb;
        border-radius: 4px;
        padding: 10px 15px;
        font-family: monospace;
        font-size: 16px;
        text-align: center;
        margin: 15px 0;
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
      <a href="https://styran.vercel.app">Styran</a>
    </div>
    <div class="content">
      <h2>Welcome to Styran!</h2>
      <p>Your account has been created. To get started, please use the temporary password below to log in:</p>
      <div class="password-box">
        <strong>${tempPassword}</strong>
      </div>
      <p>You'll be asked to create a new password after your first login.</p>
      <div style="text-align: center;">
        <a href="https://styran.vercel.app" class="btn">Open App</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p class="plain-url">"https://styran.vercel.app"</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Styran. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
};

export { inviteUserEmailTemplate };
