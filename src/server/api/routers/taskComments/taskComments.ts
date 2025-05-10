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
          .then(async () => {
            const channel = `taskCommentUpsert:${taskId}`;
            await redisClient.publish(
              channel,
              JSON.stringify({
                taskId,
                projectId,
              }),
            );
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
          .then(async () => {
            const channel = `taskCommentUpsert:${deletedComment.task.id}`;
            await redisClient.publish(
              channel,
              JSON.stringify({
                taskId: deletedComment.task.id,
                projectId,
              }),
            );
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
          .then(async () => {
            const channel = `taskCommentUpsert:${updatedComment.task.id}`;
            await redisClient.publish(
              channel,
              JSON.stringify({
                taskId: updatedComment.task.id,
                projectId,
              }),
            );
          });
      });
    }),

  onTaskCommentUpsert: projectMemberProcedure
    .input(z.object({ taskId: z.string(), projectId: z.string() }))
    .subscription(async function* ({ input, ctx }) {
      const channel = `taskCommentUpsert:${input.taskId}`;
      const subscriber = redisClient.duplicate();
      const TIMEOUT_MS = Number(env.FN_TIMEOUT_MS);
      const startTime = Date.now();

      const getTaskComments = () =>
        ctx.db.taskComment.findMany({
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

      try {
        // 1. Connect to Redis
        await subscriber.connect();

        // 3. Proper message handling setup
        const messageQueue: string[] = [];
        let messageResolver: (() => void) | null = null;

        // 4. Async subscription with error handling
        void subscriber.subscribe(channel, (message) => {
          messageQueue.push(message);
          messageResolver?.();
        });

        // 5. Message processing loop with timeout check
        while (true) {
          // Check if we've exceeded the timeout
          if (Date.now() - startTime > TIMEOUT_MS) {
            break;
          }

          while (messageQueue.length > 0) {
            messageQueue.shift()!;
            const taskComments = await getTaskComments();
            yield tracked(input.taskId, taskComments);
          }

          // Wait for new messages with timeout
          try {
            await Promise.race([
              new Promise<void>((resolve) => {
                messageResolver = resolve;
              }),
              new Promise((_, reject) => {
                const remainingTime = TIMEOUT_MS - (Date.now() - startTime);
                if (remainingTime <= 0) {
                  reject(new Error("Timeout reached"));
                }

                setTimeout(
                  () => reject(new Error("Timeout reached")),
                  remainingTime,
                );
              }),
            ]);
          } catch (error) {
            if (error instanceof Error && error.message === "Timeout reached") {
              console.log(
                "Subscription timeout reached, gracefully terminating...",
              );
              break;
            }
            throw error;
          }
        }
      } finally {
        // 6. Proper cleanup
        await subscriber.unsubscribe(channel);
        await subscriber.close();
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
