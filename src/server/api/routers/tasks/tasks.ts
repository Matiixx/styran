import { type Prisma, type Task, TaskStatus } from "@prisma/client";
import {
  type inferRouterInputs,
  type inferRouterOutputs,
  tracked,
  TRPCError,
} from "@trpc/server";
import { z } from "zod";
import { EventEmitter, on } from "events";

import map from "lodash/map";
import padStart from "lodash/padStart";
import reduce from "lodash/reduce";

import {
  NewTaskSchema,
  UNASSIGNED_USER_ID,
  UpdateTaskSchema,
} from "~/lib/schemas/taskSchemas";
import { ActivityType } from "~/lib/schemas/activityType";

import {
  createTRPCRouter,
  protectedProcedure,
  projectMemberProcedure,
} from "~/server/api/trpc";
import dayjs from "~/utils/dayjs";

const taskEventEmitter = new EventEmitter();

const tasksRouter = createTRPCRouter({
  createTask: projectMemberProcedure
    .input(NewTaskSchema)
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

      const newTask = await ctx.db.task.create({
        data: {
          title: input.title,
          type: input.type,
          customType: input.customType || null,
          createdById: ctx.session.user.id,
          projectId: validatedProject.id,
          ticker: generateTaskTicker(
            validatedProject.ticker,
            validatedProject._count.tasks,
          ),
          startAt: input.startAt,
          doneAt: input.doneAt,
        },
      });

      taskEventEmitter.emit("taskUpdate", newTask);

      await ctx.db.activityLog.create({
        data: {
          activityType: ActivityType.TaskCreated,
          description: `Task [${newTask.ticker}] ${newTask.title} (${newTask.type}) was created`,
          userId: ctx.session.user.id,
          projectId: validatedProject.id,
          taskId: newTask.id,
          newValue: JSON.stringify(newTask),
        },
      });

      return newTask;
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

      if (input.priority) {
        updates.priority = input.priority;
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

      if (input.startAt !== currentState?.startAt) {
        updates.startAt = input.startAt;
      }

      if (input.doneAt !== currentState?.doneAt) {
        updates.doneAt = input.doneAt;
      }

      const updatedTask = await ctx.db.task.update({
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

      taskEventEmitter.emit("taskUpdate", updatedTask);

      await ctx.db.activityLog.create({
        data: {
          activityType: ActivityType.TaskUpdated,
          description: `Task [${updatedTask.ticker}] ${updatedTask.title} (${updatedTask.type}) was updated`,
          userId: ctx.session.user.id,
          projectId: input.projectId,
          taskId: input.taskId,
          oldValue: JSON.stringify(currentState),
          newValue: JSON.stringify(updatedTask),
        },
      });

      return updatedTask;
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

      const deletedTask = await ctx.db.task.delete({
        where: {
          id: taskId,
          project: {
            OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
          },
        },
      });

      taskEventEmitter.emit("taskUpdate", deletedTask);

      await ctx.db.activityLog.create({
        data: {
          activityType: ActivityType.TaskDeleted,
          description: `Task [${deletedTask.ticker}] ${deletedTask.title} (${deletedTask.type}) was deleted`,
          userId,
          projectId: deletedTask.projectId,
          oldValue: JSON.stringify(deletedTask),
        },
      });

      return deletedTask;
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
          orderBy: { _count: { status: "asc" } },
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
      orderBy: { status: "asc" },
    });
  }),

  getTasksByPriority: projectMemberProcedure.query(({ ctx }) => {
    const { projectId } = ctx;

    return ctx.db.task.groupBy({
      where: { projectId, status: { not: "DONE" } },
      by: ["priority"],
      _count: { priority: true },
    });
  }),

  getProjectsTasksStats: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db.project.findMany({
      where: {
        OR: [
          { ownerId: ctx.session.user.id },
          { users: { some: { id: ctx.session.user.id } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: { id: true, email: true, lastName: true, firstName: true },
        },
      },
    });

    const tasksArray = await ctx.db.$transaction(
      map(userProjects, ({ id }) => {
        return ctx.db.task.groupBy({
          where: { projectId: id },
          by: ["status"],
          _count: { status: true },
          orderBy: { status: "asc" },
        });
      }),
    );

    const tasksMap = reduce(
      tasksArray,
      (acc, curr, index) => {
        acc[userProjects[index]!.id] = curr as {
          _count: { status: number };
          status: TaskStatus;
        }[];
        return acc;
      },
      {} as Record<
        string,
        { _count: { status: number }; status: TaskStatus }[]
      >,
    );

    return tasksMap;
  }),

  getTasksByUser: projectMemberProcedure.query(async ({ ctx }) => {
    const { projectId } = ctx;

    return ctx.db.task.findMany({
      where: {
        projectId,
        asigneeId: { not: null },
        OR: [{ Sprint: { isActive: true } }, { sprintId: null }],
      },
      select: {
        asignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }),

  onTasksUpsert: projectMemberProcedure
    .input(z.object({ projectId: z.string() }))
    .subscription(async function* ({ input, ctx }) {
      const HEARTBEAT_INTERVAL = 15000;
      let lastUpdate = Date.now();

      for await (const [task] of on(taskEventEmitter, "taskUpdate")) {
        if ((task as Task).projectId === input.projectId) {
          const tasks = await ctx.db.task.findMany({
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
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          });

          yield tracked(input.projectId, tasks);
        }

        if (Date.now() - lastUpdate > HEARTBEAT_INTERVAL) {
          yield tracked(input.projectId, { _heartbeat: Date.now() });
          lastUpdate = Date.now();
        }
      }
    }),

  onTaskUpsert: projectMemberProcedure
    .input(z.object({ taskId: z.string() }))
    .subscription(async function* ({ input, ctx }) {
      const HEARTBEAT_INTERVAL = 15000;
      let lastUpdate = Date.now();

      for await (const [taskEvent] of on(taskEventEmitter, "taskUpdate")) {
        if ((taskEvent as Task).id === input.taskId) {
          const task = await ctx.db.task.findUnique({
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

          yield tracked(input.taskId, task);
        }

        if (Date.now() - lastUpdate > HEARTBEAT_INTERVAL) {
          yield tracked(input.taskId, { _heartbeat: Date.now() });
          lastUpdate = Date.now();
        }
      }
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
