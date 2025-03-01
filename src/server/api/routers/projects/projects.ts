import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

import { editProjectSchema, newProjectSchema } from "~/lib/schemas";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { SALT_ROUNDS, SHOULD_SEND_EMAIL } from "~/server/constant";
import { inviteUserEmailTemplate } from "~/server/sendgrid/inviteUserEmail";
import { sendEmail } from "~/server/sendgrid";

import { generateTempPassword, generateTicker } from "./utils";

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

  addProject: protectedProcedure
    .input(newProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          ticker: input.ticker ? input.ticker : generateTicker(input.name),
          ownerId: ctx.session.user.id,
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

  deleteProject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: { id: input.id, ownerId: ctx.session.user.id },
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
});

export type ProjectRouterOutput = inferRouterOutputs<typeof projectsRouter>;

export default projectsRouter;
