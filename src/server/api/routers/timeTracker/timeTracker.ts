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

      if (startTime.getTime() > endTime.getTime()) {
        throw new TRPCError({ code: "BAD_REQUEST" });
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

      return ctx.db.timeTrack.delete({ where: { id: timeId } });
    }),

  updateTime: protectedProcedure
    .input(
      z.object({
        timeId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
      }),
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

      return ctx.db.timeTrack.update({
        where: { id: timeId },
        data: { startTime, endTime },
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
