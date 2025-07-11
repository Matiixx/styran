import { z } from "zod";

import {
  tracked,
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";

import {
  createTRPCRouter,
  projectMemberProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { connectRedis } from "~/server/redis";
import { ActivityType } from "~/lib/schemas/activityType";
import { env } from "~/env";

const redisClient = await connectRedis();

const timeTrackerRouter = createTRPCRouter({
  addTime: protectedProcedure
    .input(
      z.object({ taskId: z.string(), endTime: z.date(), startTime: z.date() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { taskId, startTime, endTime } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      const hasAccess = await ctx.db.task.findUnique({
        where: {
          id: taskId,
          project: {
            OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
          },
        },
      });

      if (!hasAccess) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (startTime.getTime() > endTime.getTime()) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db.$transaction(async (tx) => {
        const timeTrack = await tx.timeTrack.create({
          data: { taskId, startTime, endTime, userId },
          include: { task: { select: { ticker: true, title: true } } },
        });

        await tx.activityLog.create({
          data: {
            activityType: ActivityType.TimeTrackCreated,
            description: `Time track was created for task ${taskId} by ${userId}`,
            userId,
            taskId: hasAccess.id,
            projectId: hasAccess.projectId,
            newValue: JSON.stringify(timeTrack),
          },
        });

        return tx.task
          .update({
            where: { id: taskId },
            data: { updatedAt: new Date() },
          })
          .then(async (task) => {
            const channel = `trackTimesUpsert:${task.id}`;
            await redisClient.publish(
              channel,
              JSON.stringify({
                taskId: task.id,
                projectId: task.projectId,
              }),
            );
            return task;
          });
      });
    }),

  getTimes: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { taskId } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      return ctx.db.timeTrack.findMany({
        where: {
          taskId,
          task: {
            project: {
              OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
            },
          },
        },
        include: {
          user: true,
        },
      });
    }),

  deleteTime: protectedProcedure
    .input(z.object({ timeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { timeId } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      const hasAccess = await ctx.db.timeTrack.findUnique({
        where: { id: timeId, userId },
      });

      if (!hasAccess) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .$transaction(async (tx) => {
          const timeTrack = await tx.timeTrack.delete({
            where: { id: timeId },
            include: {
              task: {
                select: {
                  projectId: true,
                  id: true,
                  ticker: true,
                  title: true,
                },
              },
            },
          });

          await tx.activityLog.create({
            data: {
              activityType: ActivityType.TimeTrackDeleted,
              description: `Time track was deleted for task ${timeTrack.task.id} by ${userId}`,
              userId,
              taskId: timeTrack.task.id,
              projectId: timeTrack.task.projectId,
              oldValue: JSON.stringify(timeTrack),
            },
          });

          return timeTrack;
        })
        .then(async (timeTrack) => {
          const channel = `trackTimesUpsert:${timeTrack.task.id}`;
          await redisClient.publish(
            channel,
            JSON.stringify({
              taskId: timeTrack.task.id,
              projectId: timeTrack.task.projectId,
            }),
          );
          return timeTrack;
        });
    }),

  updateTime: protectedProcedure
    .input(
      z.object({ timeId: z.string(), startTime: z.date(), endTime: z.date() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { timeId, startTime, endTime } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      const hasAccess = await ctx.db.timeTrack.findUnique({
        where: { id: timeId, userId },
      });

      if (!hasAccess) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (startTime.getTime() > endTime.getTime()) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.db
        .$transaction(async (tx) => {
          const timeTrack = await tx.timeTrack.update({
            where: { id: timeId },
            data: { startTime, endTime },
            include: {
              task: {
                select: {
                  projectId: true,
                  id: true,
                  ticker: true,
                  title: true,
                },
              },
            },
          });

          await tx.activityLog.create({
            data: {
              activityType: ActivityType.TimeTrackUpdated,
              description: `Time track was updated for task ${timeTrack.task.id} by ${userId}`,
              userId,
              taskId: timeTrack.task.id,
              projectId: timeTrack.task.projectId,
              newValue: JSON.stringify(timeTrack),
            },
          });

          return timeTrack;
        })
        .then(async (timeTrack) => {
          const channel = `trackTimesUpsert:${timeTrack.task.id}`;
          await redisClient.publish(
            channel,
            JSON.stringify({
              taskId: timeTrack.task.id,
              projectId: timeTrack.task.projectId,
            }),
          );
          return timeTrack;
        });
    }),

  onTrackTimesUpsert: projectMemberProcedure
    .input(z.object({ taskId: z.string() }))
    .subscription(async function* ({ input, ctx }) {
      const channel = `trackTimesUpsert:${input.taskId}`;
      const subscriber = redisClient.duplicate();
      const TIMEOUT_MS = Number(env.FN_TIMEOUT_MS);
      const startTime = Date.now();

      const getTimeTracks = () => {
        return ctx.db.timeTrack.findMany({
          where: {
            taskId: input.taskId,
            task: {
              project: {
                OR: [
                  { ownerId: ctx.session.user.id },
                  { users: { some: { id: ctx.session.user.id } } },
                ],
              },
            },
          },
          include: { user: true },
        });
      };

      try {
        await subscriber.connect();

        // Initial task fetch
        const initialTimeTracks = await getTimeTracks();
        yield tracked(input.taskId, initialTimeTracks);

        // Set up message handling
        let shouldUpdate = false;
        await subscriber.subscribe(channel, () => {
          shouldUpdate = true;
        });

        // Process updates
        while (Date.now() - startTime < TIMEOUT_MS) {
          if (shouldUpdate) {
            const timeTracks = await getTimeTracks();
            yield tracked(input.taskId, timeTracks);
            shouldUpdate = false;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("Subscription error:", error);
        throw error;
      } finally {
        try {
          await subscriber.unsubscribe(channel);
          await subscriber.close();
          return;
        } catch (error) {
          console.error("Error cleaning up subscription:", error);
        }
      }
    }),
});

export type TimeTrackerRouterInput = inferRouterInputs<
  typeof timeTrackerRouter
>;
export type TimeTrackerRouterOutput = inferRouterOutputs<
  typeof timeTrackerRouter
>;

export default timeTrackerRouter;
