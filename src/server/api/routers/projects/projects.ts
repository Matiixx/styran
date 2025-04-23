import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

import { editProjectSchema, newProjectSchema } from "~/lib/schemas";
import {
  createTRPCRouter,
  projectMemberProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { SALT_ROUNDS, SHOULD_SEND_EMAIL } from "~/server/constant";
import { inviteUserEmailTemplate } from "~/server/sendgrid/inviteUserEmail";
import { sendEmail } from "~/server/sendgrid";
import { getCurrentDayInTimezone } from "~/utils/timeUtils";
import { ResourceUtilizationDuration } from "~/lib/resourceUtilization/durations";
import dayjs, { type Dayjs } from "~/utils/dayjs";

import { generateTempPassword, generateTicker } from "./utils";
import { ActivityType } from "~/lib/schemas/activityType";

const projectsRouter = createTRPCRouter({
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
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

    return projects;
  }),

  getProject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      const project = ctx.db.project.findUnique({
        where: {
          id,
          OR: [
            { ownerId: ctx.session.user.id },
            { users: { some: { id: ctx.session.user.id } } },
          ],
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              lastName: true,
              firstName: true,
              password: false,
            },
          },
          sprint: { where: { isActive: true } },
        },
      });

      return project;
    }),

  getProjectSettings: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      const project = ctx.db.project.findUnique({
        where: {
          id,
          OR: [
            { ownerId: ctx.session.user.id },
            { users: { some: { id: ctx.session.user.id } } },
          ],
        },
      });

      return project;
    }),

  addProject: protectedProcedure
    .input(newProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          ticker: input.ticker ? input.ticker : generateTicker(input.name),
          ownerId: ctx.session.user.id,
          timezone: input.timezone ?? 0,
          users: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  editProject: protectedProcedure
    .input(editProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.project.update({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: {
          ...input,
          ticker: input.ticker ? input.ticker : generateTicker(input.name),
        },
      });
    }),

  deleteProject: projectMemberProcedure.mutation(({ ctx, input }) => {
    const { projectId } = input;
    return ctx.db.project.delete({
      where: { id: projectId, ownerId: ctx.session.user.id },
    });
  }),

  addUserToProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string().email(),
        lastName: z.string(),
        firstName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, email, lastName, firstName } = input;

      const userExists = await ctx.db.user.findUnique({
        where: {
          email,
          projects: { none: { id: projectId } },
          ownedProjects: { none: { id: projectId } },
        },
      });

      if (userExists) {
        return ctx.db.project.update({
          where: { id: projectId, ownerId: ctx.session.user.id },
          data: { users: { connect: { email } } },
        });
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

      return ctx.db
        .$transaction([
          ctx.db.user.create({
            data: {
              email,
              lastName,
              firstName,
              password: hashedPassword,
            },
          }),
          ctx.db.project.update({
            where: { id: projectId, ownerId: ctx.session.user.id },
            data: { users: { connect: { email } } },
          }),
        ])
        .then(() => {
          if (SHOULD_SEND_EMAIL) {
            const html = inviteUserEmailTemplate(tempPassword);
            return sendEmail("Invitation to join project", html, email).then(
              () => "true",
            );
          }
          return Promise.resolve(tempPassword);
        });
    }),

  removeUserFromProject: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
          users: { some: { id: input.userId } },
        },
        data: { users: { disconnect: { id: input.userId } } },
      });
    }),

  resendInvitation: protectedProcedure
    .input(z.object({ email: z.string().email(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { email, projectId } = input;

      const isProjectOwnerAndUserExists = await ctx.db.project.findUnique({
        where: {
          ownerId: ctx.session.user.id,
          id: projectId,
          users: { some: { email } },
        },
      });

      if (!isProjectOwnerAndUserExists) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

      return ctx.db.user
        .update({
          where: { email },
          data: { password: hashedPassword },
        })
        .then(() => {
          if (SHOULD_SEND_EMAIL) {
            const html = inviteUserEmailTemplate(tempPassword);
            return sendEmail("Invitation to join project", html, email).then(
              () => "true",
            );
          }

          return tempPassword;
        });
    }),

  getProjectMembers: projectMemberProcedure.query(({ ctx }) => {
    const { projectId } = ctx;

    return ctx.db.user.findMany({
      where: { projects: { some: { id: projectId } } },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
      },
    });
  }),

  getProjectResourceUtilization: projectMemberProcedure
    .input(
      z.object({
        duration: z
          .nativeEnum(ResourceUtilizationDuration)
          .optional()
          .default(ResourceUtilizationDuration.WEEK),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId } = ctx;
      const { duration } = input;

      const projectTimezone = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: { timezone: true, sprint: { where: { isActive: true } } },
      });

      const today = getCurrentDayInTimezone(projectTimezone?.timezone ?? 0);
      const { start, end } = getStartAndEnd(
        duration,
        today,
        projectTimezone?.sprint[0],
      );

      const usersWithTimeTrack = ctx.db.user.findMany({
        where: {
          OR: [
            { projects: { some: { id: projectId } } },
            { ownedProjects: { some: { id: projectId } } },
          ],
        },
        select: {
          id: true,
          email: true,
          lastName: true,
          firstName: true,
          TimeTrack: {
            where: {
              task: { projectId },
              startTime: { gte: start.toDate(), lte: end.toDate() },
            },
            include: { task: true },
          },
        },
      });

      return usersWithTimeTrack;
    }),

  getLastActivity: projectMemberProcedure
    .input(z.object({ count: z.number().optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const { count } = input;

      const activity = await ctx.db.activityLog.findMany({
        where: { projectId: ctx.projectId },
        orderBy: { createdAt: "desc" },
        take: count,
        include: { task: true, user: true, sprint: true },
      });

      return activity;
    }),

  getActivityLogs: projectMemberProcedure
    .input(
      z.object({
        from: z.date().optional(),
        to: z.date().optional(),
        type: z.nativeEnum(ActivityType).optional(),
        user: z.string().optional(),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { from, to, type, user, projectId, page } = input;
      const LIMIT = 10;

      const activityLogs = await ctx.db.activityLog.findMany({
        where: {
          user: user ? { id: user } : undefined,
          createdAt: { gte: from, lte: to },
          projectId,
          activityType: type,
        },
        include: { task: true, user: true, sprint: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * LIMIT,
        take: LIMIT,
      });

      const total = await ctx.db.activityLog.count({
        where: {
          user: user ? { id: user } : undefined,
          createdAt: { gte: from, lte: to },
          projectId,
          activityType: type,
        },
      });

      return { activityLogs, totalPages: Math.ceil(total / LIMIT) };
    }),
});

const getStartAndEnd = (
  duration: ResourceUtilizationDuration,
  today: Dayjs,
  sprint: { startAt: Date; endAt: Date } | undefined,
) => {
  if (duration === ResourceUtilizationDuration.WEEK) {
    return {
      start: today.startOf("week"),
      end: today.endOf("week"),
    };
  }
  if (duration === ResourceUtilizationDuration.MONTH) {
    return {
      start: today.startOf("month"),
      end: today.endOf("month"),
    };
  }

  if (duration === ResourceUtilizationDuration.SPRINT && !!sprint) {
    return {
      start: dayjs(sprint.startAt),
      end: dayjs(sprint.endAt),
    };
  }

  return {
    start: today.startOf("week"),
    end: today.endOf("week"),
  };
};

export type ProjectRouterOutput = inferRouterOutputs<typeof projectsRouter>;

export default projectsRouter;
