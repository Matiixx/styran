import { z } from "zod";

import {
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const taskCommentsRouter = createTRPCRouter({
  addComment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        content: z.string(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { taskId, content, projectId } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      const hasAccess = await ctx.db.task.findUnique({
        where: {
          id: taskId,
          project: {
            id: projectId,
            OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
          },
        },
        select: { id: true },
      });

      if (!hasAccess) {
        throw new TRPCError({ message: "No access", code: "FORBIDDEN" });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.taskComment.create({
          data: { content, taskId, userId },
        });

        return tx.task.update({
          where: { id: taskId },
          data: { updatedAt: new Date() },
          select: { id: true },
        });
      });
    }),

  getComments: protectedProcedure
    .input(z.object({ taskId: z.string(), projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { taskId, projectId } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      return ctx.db.taskComment.findMany({
        where: {
          taskId,
          task: {
            project: {
              id: projectId,
              OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
            },
          },
        },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(({ ctx, input }) => {
      const { commentId } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      return ctx.db.$transaction(async (tx) => {
        await tx.taskComment.delete({ where: { id: commentId, userId } });

        return tx.task.updateMany({
          where: { TaskComment: { some: { id: commentId } } },
          data: { updatedAt: new Date() },
        });
      });
    }),

  editComment: protectedProcedure
    .input(z.object({ commentId: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      const { commentId, content } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      return ctx.db.$transaction(async (tx) => {
        await tx.taskComment.update({
          where: { id: commentId, userId },
          data: { content },
        });

        return tx.task.updateMany({
          where: { TaskComment: { some: { id: commentId } } },
          data: { updatedAt: new Date() },
        });
      });
    }),
});

export type TaskCommentsRouterInput = inferRouterInputs<
  typeof taskCommentsRouter
>;
export type TaskCommentsRouterOutput = inferRouterOutputs<
  typeof taskCommentsRouter
>;

export default taskCommentsRouter;
