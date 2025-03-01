import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const resetPasswordCodeSchema = z.object({
  userId: z.string().min(1),
  emailExpiration: z.number().min(1),
});

export type ResetPasswordCode = z.infer<typeof resetPasswordCodeSchema>;
