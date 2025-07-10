import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { google } from "googleapis";

import isEmpty from "lodash/isEmpty";
import size from "lodash/size";

import {
  createTRPCRouter,
  protectedOpenProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendDiscordMessage } from "~/server/integrations/discord";
import { executePromisesBatch } from "~/utils/promiseUtils";
import {
  getTimezonesInTargetHourWindow,
  DayOfWeek,
  getCurrentDayInTimezone,
  getDayInTimezone,
} from "~/utils/timeUtils";
import dayjs from "~/utils/dayjs";

import { generateDiscordTaskEmbed } from "./utils";

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

      const endOfWeek = getCurrentDayInTimezone(targetTimezones[0]!).endOf(
        "week",
      );
      const startOfWeek = getCurrentDayInTimezone(targetTimezones[0]!).startOf(
        "week",
      );

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
          tasks: {
            where: {
              status: { not: "DONE" },
              doneAt: { lte: endOfWeek.toDate(), gte: startOfWeek.toDate() },
            },
            include: { asignee: true },
          },
        },
      });

      console.log(
        `Found ${projectsToNotify.length} projects to notify for Monday morning.`,
      );

      const sendMessagePromises = projectsToNotify.map((project) => () => {
        console.log(
          `Sending Monday ${TARGET_HOUR}:00 notification to project: ${project.id} - ${project.name} (timezone: ${project.timezone})`,
        );

        if (isEmpty(project.tasks)) {
          return sendDiscordMessage(
            project.discordWebhookUrl!,
            `Good news! There is no task with deadline in the ${startOfWeek.format("DD.MM.YYYY")} - ${endOfWeek.format("DD.MM.YYYY")} period for project ${project.name}!`,
          ).catch((error) => {
            console.error(error);
          });
        }

        const taskEmbeds = project.tasks.map((task) =>
          generateDiscordTaskEmbed({ ...task, timezone: project.timezone }),
        );

        console.log(`Send ${size(taskEmbeds)} embeds`);

        const thisWeekTasksMessage = `**${startOfWeek.format("DD.MM.YYYY")} - ${endOfWeek.format("DD.MM.YYYY")}**\n\nGood Monday morning! It's the start of a new week for project ${project.name}!\nHere are the tasks or events due this week:`;

        return sendDiscordMessage(
          project.discordWebhookUrl!,
          thisWeekTasksMessage,
          taskEmbeds,
        ).catch((error) => {
          console.error(error);
        });
      });

      await executePromisesBatch(sendMessagePromises, 10);

      console.log("All messages sent successfully.");

      return { success: true };
    }),

  sendHourlyDiscordNotifications: protectedOpenProcedure
    .meta({
      openapi: { method: "POST", path: "/sendHourlyDiscordNotifications" },
    })
    .input(z.void())
    .output(z.object({ success: z.boolean() }))
    .query(async ({ ctx }) => {
      const now = dayjs.utc().add(1, "hour");

      const roundedHour =
        now.minute() >= 30
          ? now.add(1, "hour").startOf("hour")
          : now.startOf("hour");

      console.log(
        `Checking for tasks due between ${roundedHour.format("HH:mm")} and ${roundedHour.add(1, "hour").format("HH:mm")} UTC`,
      );

      const tasksDueInNextHour = await ctx.db.task.findMany({
        where: {
          doneAt: {
            lte: roundedHour.endOf("hour").toDate(),
            gte: roundedHour.startOf("hour").toDate(),
          },
          status: { not: "DONE" },
          project: { discordWebhookUrl: { not: null } },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              timezone: true,
              discordWebhookUrl: true,
            },
          },
          asignee: true,
        },
      });

      console.log(
        `Found ${size(tasksDueInNextHour)} tasks due within the next hour.`,
      );

      const sendMessagePromises = tasksDueInNextHour.map((task) => () => {
        const message = `**${task.title}** deadline within the next hour!\n${getDayInTimezone(task.doneAt!, task.project.timezone).format("DD.MM.YYYY HH:mm")}`;
        const taskEmbed = generateDiscordTaskEmbed({
          ...task,
          timezone: task.project.timezone,
        });

        return sendDiscordMessage(task.project.discordWebhookUrl!, message, [
          taskEmbed,
        ]).then(() => {
          if (task.asignee?.discordWebhookUrl) {
            return sendDiscordMessage(task.asignee.discordWebhookUrl, message, [
              taskEmbed,
            ]);
          }
        });
      });

      await executePromisesBatch(sendMessagePromises, 10);

      console.log("All messages sent successfully.");

      return { success: true };
    }),

  integrateGoogleCalendar: protectedProcedure
    .input(z.object({ checked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI,
      );

      if (!input.checked) {
        const userRefreshToken = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { gclRefreshToken: true },
        });

        if (userRefreshToken?.gclRefreshToken) {
          oauth2Client.setCredentials({
            refresh_token: userRefreshToken.gclRefreshToken,
          });
          const { token } = await oauth2Client.getAccessToken();
          oauth2Client.setCredentials({ access_token: token });
          await oauth2Client.revokeCredentials();
          await ctx.db.user.update({
            where: { id: ctx.session.user.id },
            data: { gclRefreshToken: null },
          });
          return { success: true };
        }

        return { success: true };
      }

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      return { authUrl };
    }),

  googleCalendarRedirect: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!input.code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No code provided",
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI,
      );

      const { tokens } = await oauth2Client.getToken({ code: input.code });
      if (tokens.refresh_token) {
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { gclRefreshToken: tokens.refresh_token },
        });

        return { success: true };
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No refresh token provided",
      });
    }),
});

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const REDIRECT_URI = "https://styran.vercel.app/my-profile/gcl-integration";

export default integrationsRouter;
