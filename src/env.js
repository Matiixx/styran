import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // AUTH_DISCORD_ID: z.string(),
    // AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SENDGRID_API_KEY: z.string(),
    SENDGRID_FROM_EMAIL: z.string(),
    RESET_PASSWORD_SECRET: z.string(),
    CUSTOM_LOGIN: z.string(),
    CUSTOM_PASSWORD: z.string(),
    OPEN_SECRET: z.string(),
    APP_URL: z.string().url(),
    FN_TIMEOUT_MS: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    SHOULD_SEND_EMAIL: z.string(),
    GMAIL_CLIENT_ID: z.string(),
    GMAIL_CLIENT_SECRET: z.string(),
    GMAIL_REFRESH_TOKEN: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    // AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    // AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    RESET_PASSWORD_SECRET: process.env.RESET_PASSWORD_SECRET,
    CUSTOM_LOGIN: process.env.CUSTOM_LOGIN,
    CUSTOM_PASSWORD: process.env.CUSTOM_PASSWORD,
    OPEN_SECRET: process.env.OPEN_SECRET,
    APP_URL: process.env.APP_URL,
    FN_TIMEOUT_MS: process.env.FN_TIMEOUT_MS,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SHOULD_SEND_EMAIL: process.env.SHOULD_SEND_EMAIL,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
