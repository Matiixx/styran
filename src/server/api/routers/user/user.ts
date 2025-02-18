import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { EMAIL_DUPLICATION } from "~/lib/errorCodes";
import { sendEmail } from "~/server/mailgun";

import { registerSchema } from "./types";

const SALT_ROUNDS = 12;

const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user
        .create({
          data: {
            email: input.email,
            password: await bcrypt.hash(input.password, SALT_ROUNDS),
            firstName: input.firstName,
            lastName: input.lastName,
          },
        })
        .catch((e) => {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: EMAIL_DUPLICATION,
              });
            }
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });
    }),

  sendResetEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const resetPasswordCode = user.id;

      return `http://localhost:3000/api/auth/reset/${resetPasswordCode}`;

      return sendEmail(
        "Reset Password",
        `Open this link to set new password: http://localhost:3000/api/auth/reset/${resetPasswordCode}`,
      );
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        code: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.code },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.user.update({
        where: { id: input.code },
        data: { password: await bcrypt.hash(input.password, SALT_ROUNDS) },
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!(await bcrypt.compare(input.oldPassword, user.password))) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: await bcrypt.hash(input.newPassword, SALT_ROUNDS) },
      });
    }),
});

export default userRouter;
