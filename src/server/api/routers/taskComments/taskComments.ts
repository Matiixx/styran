import { z } from "zod";
import { EventEmitter, on } from "events";

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
import { ActivityType } from "~/lib/schemas/activityType";

const taskCommentEventEmitter = new EventEmitter();

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

        await tx.activityLog.create({
          data: {
            activityType: ActivityType.CommentCreated,
            description: `Task [${taskId}] was commented by ${userId}`,
            userId,
            taskId,
            projectId,
          },
        });

        return tx.task
          .update({
            where: { id: taskId },
            data: { updatedAt: new Date() },
            select: { id: true },
          })
          .then(() => {
            taskCommentEventEmitter.emit("onTaskCommentUpsert", {
              taskId,
              projectId,
            });
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

  deleteComment: projectMemberProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(({ ctx, input }) => {
      const { commentId, projectId } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      return ctx.db.$transaction(async (tx) => {
        const deletedComment = await tx.taskComment.delete({
          where: { id: commentId, userId },
          include: {
            task: { select: { id: true, ticker: true, title: true } },
          },
        });

        await tx.activityLog.create({
          data: {
            activityType: ActivityType.CommentDeleted,
            description: `Task comment was deleted by ${userId}`,
            userId,
            commentId,
            projectId,
            oldValue: JSON.stringify(deletedComment),
          },
        });

        return tx.task
          .updateMany({
            where: { TaskComment: { some: { id: commentId } } },
            data: { updatedAt: new Date() },
          })
          .then(() => {
            taskCommentEventEmitter.emit("onTaskCommentUpsert", {
              taskId: deletedComment.task.id,
              projectId,
            });
          });
      });
    }),

  editComment: projectMemberProcedure
    .input(z.object({ commentId: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      const { commentId, content, projectId } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      return ctx.db.$transaction(async (tx) => {
        const updatedComment = await tx.taskComment.update({
          where: { id: commentId, userId },
          data: { content },
          include: {
            task: { select: { id: true, ticker: true, title: true } },
          },
        });

        await tx.activityLog.create({
          data: {
            activityType: ActivityType.CommentUpdated,
            description: `Task comment was updated by ${userId}`,
            userId,
            commentId,
            projectId,
            newValue: JSON.stringify(updatedComment),
          },
        });

        return tx.task
          .updateMany({
            where: { TaskComment: { some: { id: commentId } } },
            data: { updatedAt: new Date() },
          })
          .then(() => {
            taskCommentEventEmitter.emit("onTaskCommentUpsert", {
              taskId: updatedComment.task.id,
              projectId,
            });
          });
      });
    }),

  onTaskCommentUpsert: projectMemberProcedure
    .input(z.object({ taskId: z.string(), projectId: z.string() }))
    .subscription(async function* ({ input, ctx }) {
      for await (const [taskComment] of on(
        taskCommentEventEmitter,
        "onTaskCommentUpsert",
      )) {
        if (
          (taskComment as { projectId: string }).projectId === input.projectId
        ) {
          const taskComments = await ctx.db.taskComment.findMany({
            where: {
              taskId: input.taskId,
              task: {
                project: {
                  id: input.projectId,
                  OR: [
                    { ownerId: ctx.session.user.id },
                    { users: { some: { id: ctx.session.user.id } } },
                  ],
                },
              },
            },
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          });

          yield tracked(input.taskId, taskComments);
        }
      }
    }),
});

export type TaskCommentsRouterInput = inferRouterInputs<
  typeof taskCommentsRouter
>;
export type TaskCommentsRouterOutput = inferRouterOutputs<
  typeof taskCommentsRouter
>;

export default taskCommentsRouter;
