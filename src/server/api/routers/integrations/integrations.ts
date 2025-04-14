import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  sendDiscordMessage,
  sendDiscordDirectMessage,
} from "~/server/integrations/discord";

const integrationsRouter = createTRPCRouter({
  testDiscordPersonalWebhook: protectedProcedure.mutation(async ({ ctx }) => {
    const {
      user: { id: userId },
    } = ctx.session;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { discordWebhookUrl: true },
    });

    if (!user?.discordWebhookUrl) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User or webhook not found",
      });
    }

    return sendDiscordMessage(
      user.discordWebhookUrl,
      "Test message from Styran!",
    );
  }),

  testDiscordDirectMessage: protectedProcedure.mutation(async ({ ctx }) => {
    const {
      user: { id: userId },
    } = ctx.session;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
    });

    if (!user?.discordId || !user?.discordAccessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not connected to Discord or missing access token",
      });
    }

    return sendDiscordDirectMessage(
      user.discordId,
      user.discordAccessToken,
      "Test direct message from Styran!",
    );
  }),

  sendDiscordDirectMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user?.discordId || !user?.discordAccessToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not connected to Discord or missing access token",
        });
      }

      return sendDiscordDirectMessage(
        user.discordId,
        user.discordAccessToken,
        input.message,
      );
    }),
});

export default integrationsRouter;
