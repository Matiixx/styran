import { z } from "zod";

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
});

export const editProjectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  ticker: z.string().optional(),
});
