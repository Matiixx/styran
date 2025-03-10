import { z } from "zod";

import {
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const timeTrackerRouter = createTRPCRouter({
  addTime: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        endTime: z.date(),
        startTime: z.date(),
      }),
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

      return ctx.db.$transaction(async (tx) => {
        await tx.timeTrack.create({
          data: { taskId, startTime, endTime, userId },
        });

        return tx.task.update({
          where: { id: taskId },
          data: { updatedAt: new Date() },
        });
      });
    }),

  getTimes: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
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
      });
    }),
});

export type TimeTrackerRouterInput = inferRouterInputs<
  typeof timeTrackerRouter
>;
export type TimeTrackerRouterOutput = inferRouterOutputs<
  typeof timeTrackerRouter
>;

export default timeTrackerRouter;
