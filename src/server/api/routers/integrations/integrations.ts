import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedOpenProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendDiscordMessage } from "~/server/integrations/discord";
import { executePromisesBatch } from "~/utils/promiseUtils";
import { getTimezonesInTargetHourWindow, DayOfWeek } from "~/utils/timeUtils";

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
      const TARGET_DAY = DayOfWeek.MONDAY;

      const targetTimezones = getTimezonesInTargetHourWindow(
        TARGET_HOUR,
        BUFFER_MINUTES,
        TARGET_DAY,
      );

      console.log(
        `Timezones currently at Monday ${TARGET_HOUR}:00 (±${BUFFER_MINUTES}min):`,
        targetTimezones,
      );

      if (targetTimezones.length === 0) {
        console.log(
          `No timezones are currently at Monday ${TARGET_HOUR}:00 (±${BUFFER_MINUTES}min). Skipping notifications.`,
        );
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

      console.log(
        `Found ${projectsToNotify.length} projects to notify for Monday morning.`,
      );

      const sendMessagePromises = projectsToNotify.map((project) => () => {
        console.log(
          `Sending Monday ${TARGET_HOUR}:00 notification to project: ${project.id} - ${project.name} (timezone: ${project.timezone})`,
        );

        return sendDiscordMessage(
          project.discordWebhookUrl!,
          `Good Monday morning! It's the start of a new week for project ${project.name}!`,
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
