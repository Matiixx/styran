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

import {
  createTRPCRouter,
  protectedProcedure,
  projectMemberProcedure,
} from "~/server/api/trpc";
import dayjs from "dayjs";

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

  getCompletedTaskCount: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      const now = dayjs();
      const currentMonthStart = now.startOf("month");
      const nextMonthStart = now.add(1, "month").startOf("month");
      const previousMonthStart = now.subtract(1, "month").startOf("month");

      const [
        currentMonthTasksCount,
        previousMonthTasksCount,
        groupedTasksCount,
        lastMonthGroupedTasksCount,
      ] = await ctx.db.$transaction([
        ctx.db.task.count({
          where: {
            projectId,
            status: TaskStatus.DONE,
            createdAt: {
              gte: currentMonthStart.toDate(),
              lt: nextMonthStart.toDate(),
            },
          },
        }),
        ctx.db.task.count({
          where: {
            projectId,
            status: TaskStatus.DONE,
            createdAt: {
              gte: previousMonthStart.toDate(),
              lt: currentMonthStart.toDate(),
            },
          },
        }),
        ctx.db.task.groupBy({
          where: { projectId },
          by: ["status"],
          _count: { status: true },
          orderBy: { status: "asc" },
        }),
        ctx.db.task.groupBy({
          where: { projectId, createdAt: { lt: currentMonthStart.toDate() } },
          by: ["status"],
          _count: { status: true },
          orderBy: { status: "asc" },
        }),
      ]);

      return {
        groupedTasksCount,
        currentMonthTasksCount,
        previousMonthTasksCount,
        lastMonthGroupedTasksCount,
      };
    }),

  getHighPriorityTasks: projectMemberProcedure.query(({ ctx }) => {
    const { projectId } = ctx;

    return ctx.db.task.findMany({
      where: { projectId, status: { not: "DONE" }, priority: "HIGH" },
    });
  }),

  getActivityOverview: projectMemberProcedure
    .input(z.object({ days: z.enum(["7", "30"]).default("7") }))
    .use(async ({ input, next }) => {
      if (input.days === "30") {
        return next({ ctx: { days: 30 } });
      }
      return next({ ctx: { days: 7 } });
    })
    .query(({ ctx }) => {
      const { projectId, days } = ctx;

      const now = dayjs();
      const startDate = now.subtract(days, "days").startOf("day");

      return ctx.db.task.findMany({
        where: {
          projectId,
          OR: [
            { createdAt: { gte: startDate.toDate() } },
            { doneAt: { gte: startDate.toDate(), lte: now.toDate() } },
          ],
        },
        select: { createdAt: true, doneAt: true, status: true },
      });
    }),

  getTasksByStatus: projectMemberProcedure.query(({ ctx }) => {
    const { projectId } = ctx;

    return ctx.db.task.groupBy({
      where: {
        projectId,
        OR: [{ Sprint: { isActive: true } }, { sprintId: null }],
      },
      by: ["status"],
      _count: { status: true },
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
