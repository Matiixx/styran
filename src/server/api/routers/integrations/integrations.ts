import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedOpenProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendDiscordMessage } from "~/server/integrations/discord";

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

  sendProjectDiscordNotifications: protectedOpenProcedure
    .meta({
      openapi: { method: "POST", path: "/sendProjectDiscordNotifications" },
    })
    .input(z.void())
    .output(z.object({ success: z.boolean() }))
    .query(async ({ ctx }) => {
      const projectsWithDiscordWebhook = await ctx.db.project.findMany({
        where: { discordWebhookUrl: { not: null } },
      });

      console.log(projectsWithDiscordWebhook);

      return { success: true };
    }),
});

export default integrationsRouter;
