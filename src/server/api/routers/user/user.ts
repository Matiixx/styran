import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

import noop from "lodash/noop";

import {
  type inferRouterInputs,
  type inferRouterOutputs,
  TRPCError,
} from "@trpc/server";

import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { EMAIL_DUPLICATION } from "~/lib/errorCodes";
import {
  sendEmail,
  forgetPasswordEmailTemplate,
  emailVerificationTemplate,
} from "~/server/sendgrid";
import { decryptText, encryptObject } from "~/server/encryption";
import {
  SALT_ROUNDS,
  EMAIL_EXPIRATION_TIME,
  SHOULD_SEND_EMAIL,
} from "~/server/constant";

import dayjs from "~/utils/dayjs";

import {
  type EmailVerificationCode,
  registerSchema,
  type ResetPasswordCode,
  resetPasswordCodeSchema,
} from "./types";

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
      const emailExpiration = dayjs()
        .add(EMAIL_EXPIRATION_TIME, "hours")
        .valueOf();

      const encryptedCode = encryptObject(
        { userId: user.id, emailExpiration } satisfies ResetPasswordCode,
        env.RESET_PASSWORD_SECRET,
      );

      const urlWithCode = `https://styran.vercel.app/api/auth/reset/${encryptedCode}`;

      if (SHOULD_SEND_EMAIL) {
        const html = forgetPasswordEmailTemplate(urlWithCode);
        return sendEmail("Reset Password", html, input.email).then(noop);
      }

      return urlWithCode;
    }),

  resetPassword: publicProcedure
    .input(z.object({ code: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const decryptedCode = decryptText<ResetPasswordCode>(
        input.code,
        env.RESET_PASSWORD_SECRET,
      );

      if (!resetPasswordCodeSchema.safeParse(decryptedCode).success) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const { userId, emailExpiration } = decryptedCode;

      if (dayjs().isAfter(dayjs(emailExpiration))) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(input.password, SALT_ROUNDS) },
      });
    }),

  changePassword: protectedProcedure
    .input(z.object({ oldPassword: z.string(), newPassword: z.string() }))
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

  getUserInfo: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  updateUserInfo: protectedProcedure
    .input(
      z.object({
        location: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        email: z.string().email().optional(),
        bio: z.string().nullable().optional(),
        discordWebhookUrl: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const update: Prisma.UserUpdateInput = {
        ...(input.location !== undefined && {
          location: input.location ?? undefined,
        }),
        ...(input.jobTitle !== undefined && {
          jobTitle: input.jobTitle ?? undefined,
        }),
        ...(input.firstName !== undefined && {
          firstName: input.firstName ?? undefined,
        }),
        ...(input.lastName !== undefined && {
          lastName: input.lastName ?? undefined,
        }),
        ...(input.bio !== undefined && { bio: input.bio ?? undefined }),
        ...(input.discordWebhookUrl !== undefined && {
          discordWebhookUrl: input.discordWebhookUrl ?? undefined,
        }),
      };

      if (input.email) {
        if (SHOULD_SEND_EMAIL) {
          const emailVerificationCode = encryptObject(
            {
              userId: ctx.session.user.id,
              newEmail: input.email,
              emailExpiration: dayjs()
                .add(EMAIL_EXPIRATION_TIME, "hours")
                .valueOf(),
            } satisfies EmailVerificationCode,
            env.RESET_PASSWORD_SECRET,
          );
          const urlWithCode = `https://styran.vercel.app/api/auth/verify-email/${emailVerificationCode}`;
          const html = emailVerificationTemplate(urlWithCode);
          await sendEmail("Verify Email", html, input.email).then(noop);
        } else {
          update.email = input.email;
        }
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: update,
      });
    }),

  verifyEmail: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const decryptedCode = decryptText<EmailVerificationCode>(
        input.code,
        env.RESET_PASSWORD_SECRET,
      );

      if (decryptedCode.emailExpiration < dayjs().valueOf()) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: decryptedCode.userId },
        select: { email: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.email === decryptedCode.newEmail) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db.user.update({
        where: { id: decryptedCode.userId },
        data: { email: decryptedCode.newEmail },
      });
    }),
});

type UserRouterInputs = inferRouterInputs<typeof userRouter>;
type UserRouterOutputs = inferRouterOutputs<typeof userRouter>;

export { type UserRouterInputs, type UserRouterOutputs };

export default userRouter;
