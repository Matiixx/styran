import { newProjectSchema } from "~/lib/schemas";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const projectsRouter = createTRPCRouter({
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return projects;
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
});

export default projectsRouter;
