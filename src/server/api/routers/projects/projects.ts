import { z } from "zod";
import { type inferRouterOutputs } from "@trpc/server";

import { editProjectSchema, newProjectSchema } from "~/lib/schemas";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const projectsRouter = createTRPCRouter({
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),

  getProject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      const project = ctx.db.project.findUnique({
        where: { id, ownerId: ctx.session.user.id },
      });

      return project;
    }),

  addProject: protectedProcedure
    .input(newProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          ticker: input.ticker,
          ownerId: ctx.session.user.id,
        },
      });
    }),

  editProject: protectedProcedure
    .input(editProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.project.update({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: input,
      });
    }),

  deleteProject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: { id: input.id, ownerId: ctx.session.user.id },
      });
    }),
});

export type ProjectRouterOutput = inferRouterOutputs<typeof projectsRouter>;

export default projectsRouter;
