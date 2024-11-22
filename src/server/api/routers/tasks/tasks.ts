import { type Prisma, TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import padStart from "lodash/padStart";

import { NewTaskSchema, UpdateTaskSchema } from "~/lib/schemas/taskSchemas";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const tasksRouter = createTRPCRouter({
  createTask: protectedProcedure
    .input(z.intersection(z.object({ projectId: z.string() }), NewTaskSchema))
    .mutation(async ({ ctx, input }) => {
      const validatedProject = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          OR: [
            { users: { some: { id: ctx.session.user.id } } },
            { ownerId: ctx.session.user.id },
          ],
        },
        select: { id: true, ticker: true, _count: { select: { tasks: true } } },
      });

      if (!validatedProject) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a member of this project",
        });
      }

      return ctx.db.task.create({
        data: {
          title: input.title,
          type: input.type,
          createdById: ctx.session.user.id,
          projectId: validatedProject.id,
          ticker: generateTaskTicker(
            validatedProject.ticker,
            validatedProject._count.tasks,
          ),
        },
      });
    }),

  getTasks: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          projectId: input.projectId,
          project: {
            OR: [
              { users: { some: { id: ctx.session.user.id } } },
              { ownerId: ctx.session.user.id },
            ],
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  getTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        taskId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: {
          id: input.taskId,
          projectId: input.projectId,
          project: {
            OR: [
              { users: { some: { id: ctx.session.user.id } } },
              { ownerId: ctx.session.user.id },
            ],
          },
        },
      });
    }),

  updateTask: protectedProcedure
    .input(UpdateTaskSchema)
    .mutation(({ ctx, input }) => {
      const updates: Prisma.TaskUpdateInput = {};

      if (input.status) {
        updates.status = input.status;
        if (updates.status === TaskStatus.TODO) {
          updates.doneAt = null;
          updates.startAt = null;
        } else if (updates.status === TaskStatus.DONE) {
          updates.doneAt = new Date();
        } else if (
          updates.status === TaskStatus.IN_PROGRESS ||
          updates.status === TaskStatus.IN_REVIEW
        ) {
          updates.startAt = new Date();
        }
      }

      return ctx.db.task.update({
        where: {
          id: input.taskId,
          project: {
            id: input.projectId,
            OR: [
              { users: { some: { id: ctx.session.user.id } } },
              { ownerId: ctx.session.user.id },
            ],
          },
        },
        data: updates,
      });
    }),
});

export const generateTaskTicker = (
  projectTicker: string,
  taskCount: number,
) => {
  const paddedTaskCount = padStart(`${taskCount + 1}`, 3, "0");
  return `${projectTicker}-${paddedTaskCount}`;
};

export default tasksRouter;
