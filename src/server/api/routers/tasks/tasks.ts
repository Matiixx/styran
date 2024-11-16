import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { NewTaskSchema } from "~/lib/schemas/taskSchemas";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const tasksRouter = createTRPCRouter({
  createTask: protectedProcedure
    .input(z.intersection(z.object({ projectId: z.string() }), NewTaskSchema))
    .mutation(async ({ ctx, input }) => {
      const validatedProjectId = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          OR: [
            { users: { some: { id: ctx.session.user.id } } },
            { ownerId: ctx.session.user.id },
          ],
        },
        select: { id: true },
      });

      if (!validatedProjectId) {
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
          projectId: validatedProjectId.id,
        },
      });
    }),
});

export default tasksRouter;
