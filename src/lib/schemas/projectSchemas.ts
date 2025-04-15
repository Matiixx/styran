import { z } from "zod";

export const discordRegex = new RegExp(
  "^https://discord.com/api/webhooks/.+/.+$",
);

export const newProjectSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name should have at least 3 characters" }),
  ticker: z
    .string()
    .min(2, { message: "Ticker should have at least 2 characters" })
    .max(4, { message: "Ticker should have at most 4 characters" })
    .optional()
    .or(z.literal("")),
  description: z.string().optional().nullable(),
  timezone: z.number().min(-12).max(12).optional(),
});

export const editProjectSchema = z.object({
  id: z.string(),
  name: newProjectSchema.shape.name,
  ticker: newProjectSchema.shape.ticker,
  timezone: newProjectSchema.shape.timezone,
  description: newProjectSchema.shape.description,
  discordWebhookUrl: z
    .string()
    .regex(discordRegex, "Invalid Discord webhook URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});
