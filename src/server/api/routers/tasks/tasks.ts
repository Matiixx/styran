import { TRPCError } from "@trpc/server";
import { z } from "zod";

import padStart from "lodash/padStart";

import { NewTaskSchema } from "~/lib/schemas/taskSchemas";

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
        include: { createdBy: true },
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
