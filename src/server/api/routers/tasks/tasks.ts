import { type Prisma, TaskStatus } from "@prisma/client";
import {
  type inferRouterInputs,
  type inferRouterOutputs,
  TRPCError,
} from "@trpc/server";
import { z } from "zod";

import padStart from "lodash/padStart";

import {
  NewTaskSchema,
  UNASSIGNED_USER_ID,
  UpdateTaskSchema,
} from "~/lib/schemas/taskSchemas";

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
          OR: [{ Sprint: { isActive: true } }, { sprintId: null }],
        },
        orderBy: { createdAt: "asc" },
        include: {
          asignee: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });
    }),

  getTask: protectedProcedure
    .input(z.object({ projectId: z.string(), taskId: z.string() }))
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
        include: { asignee: true },
      });
    }),

  updateTask: protectedProcedure
    .input(UpdateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const updates: Prisma.TaskUpdateInput = {};
      const currentState = await ctx.db.task.findUnique({
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
      });

      if (input.status) {
        updates.status = input.status;

        if (
          !currentState?.startAt &&
          updates.status === TaskStatus.IN_PROGRESS
        ) {
          updates.startAt = new Date();
        }

        if (updates.status === TaskStatus.DONE) {
          updates.doneAt = new Date();
        }
      }

      if (input.title) {
        updates.title = input.title;
      }

      if (input.startAt) {
        updates.startAt = input.startAt;
      }

      if (input.doneAt) {
        updates.doneAt = input.doneAt;
      }

      if (input.assigneeId && input.assigneeId !== UNASSIGNED_USER_ID) {
        updates.asignee = { connect: { id: input.assigneeId } };
      } else if (input.assigneeId === UNASSIGNED_USER_ID) {
        updates.asignee = { disconnect: true };
      }

      if (input.description !== undefined) {
        if (input.description.trim() === "") {
          updates.description = null;
        } else {
          updates.description = input.description;
        }
      }

      if (input.storyPoints !== currentState?.storyPoints) {
        updates.storyPoints = input.storyPoints;
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

  moveTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        taskId: z.string(),
        sprint: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, taskId, sprint } = input;
      if (sprint) {
        const currentSprint = await ctx.db.sprint.findFirst({
          where: {
            project: {
              id: projectId,
              OR: [
                { users: { some: { id: ctx.session.user.id } } },
                { ownerId: ctx.session.user.id },
              ],
            },
            isActive: true,
          },
        });

        if (!currentSprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No active sprint found",
          });
        }

        return ctx.db.task.update({
          where: { id: taskId, projectId },
          data: { sprintId: currentSprint.id },
        });
      }

      return ctx.db.task.update({
        where: { id: taskId, projectId },
        data: { Sprint: { disconnect: true } },
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { taskId } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx;

      return ctx.db.task.delete({
        where: {
          id: taskId,
          project: {
            OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
          },
        },
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

export type TasksRouterOutput = inferRouterOutputs<typeof tasksRouter>;
export type TasksRouterInput = inferRouterInputs<typeof tasksRouter>;

export default tasksRouter;
