import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedOpenProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendDiscordMessage } from "~/server/integrations/discord";
import { executePromisesBatch } from "~/utils/promiseUtils";
import { getTimezonesInTargetHourWindow } from "~/utils/timeUtils";

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
      const TARGET_HOUR = 8;
      const BUFFER_MINUTES = 15;

      const targetTimezones = getTimezonesInTargetHourWindow(
        TARGET_HOUR,
        BUFFER_MINUTES,
      );

      console.log(
        `Timezones currently at ${TARGET_HOUR}:00 (±${BUFFER_MINUTES}min):`,
        targetTimezones,
      );

      if (targetTimezones.length === 0) {
        return { success: true };
      }

      const projectsToNotify = await ctx.db.project.findMany({
        where: {
          discordWebhookUrl: { not: null },
          timezone: { in: targetTimezones },
        },
        select: {
          id: true,
          name: true,
          discordWebhookUrl: true,
          timezone: true,
        },
      });

      const sendMessagePromises = projectsToNotify.map((project) => () => {
        console.log(
          `Sent ${TARGET_HOUR}:00 notification to project: ${project.id} - ${project.name} (timezone: ${project.timezone})`,
        );

        return sendDiscordMessage(
          project.discordWebhookUrl!,
          `Good morning! It's a new day for project ${project.name}!`,
        ).catch((error) => {
          console.error(
            `Error sending message to project ${project.id} - ${project.name}:`,
            error,
          );
          return;
        });
      });

      await executePromisesBatch(sendMessagePromises, 10);

      return { success: true };
    }),
});

export default integrationsRouter;
