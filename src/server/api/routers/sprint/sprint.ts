import { z } from "zod";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter, projectMemberProcedure } from "~/server/api/trpc";
import { StartSprintSchema } from "~/lib/schemas/sprintSchemas";
import { startOfDay } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { TaskStatus } from "@prisma/client";
import { ActivityType } from "~/lib/schemas/activityType";

const sprintRouter = createTRPCRouter({
  startSprint: projectMemberProcedure
    .input(StartSprintSchema)
    .mutation(async ({ ctx, input }) => {
      const parsedInput = {
        ...input,
        startDate: new UTCDate(startOfDay(input.startDate)),
        endDate: new UTCDate(startOfDay(input.endDate)),
      };

      let sprint;

      if (parsedInput.includeTasksFromBacklog) {
        const freeTaskIds = await ctx.db.task.findMany({
          where: { projectId: parsedInput.projectId, sprintId: null },
          select: { id: true },
        });

        sprint = await ctx.db.sprint
          .create({
            data: {
              name: parsedInput.name,
              goal: parsedInput.goal,
              startAt: parsedInput.startDate,
              endAt: parsedInput.endDate,
              project: {
                connect: {
                  id: parsedInput.projectId,
                  sprint: { none: { isActive: true } },
                },
              },
              tasks: {
                connect: freeTaskIds.map((taskId) => ({ id: taskId.id })),
              },
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Some sprint is already active",
            });
          });
      } else {
        sprint = await ctx.db.sprint
          .create({
            data: {
              name: parsedInput.name,
              goal: parsedInput.goal,
              startAt: parsedInput.startDate,
              endAt: parsedInput.endDate,
              project: {
                connect: {
                  id: parsedInput.projectId,
                  sprint: { none: { isActive: true } },
                },
              },
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Some sprint is already active",
            });
          });
      }

      await ctx.db.activityLog.create({
        data: {
          activityType: ActivityType.SprintCreated,
          description: `Sprint [${parsedInput.name}] was created`,
          userId: ctx.session.user.id,
          projectId: parsedInput.projectId,
          sprintId: sprint.id,
          newValue: JSON.stringify(sprint),
        },
      });

      return sprint;
    }),

  endSprint: projectMemberProcedure
    .input(z.object({ sprintId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        await tx.task.updateMany({
          where: {
            project: { id: input.projectId, ownerId: ctx.session.user.id },
            sprintId: input.sprintId,
            status: { not: TaskStatus.DONE },
          },
          data: { sprintId: null },
        });

        const sprint = await tx.sprint.update({
          where: {
            id: input.sprintId,
            project: { id: input.projectId, ownerId: ctx.session.user.id },
          },
          data: { endAt: new UTCDate(), isActive: false },
        });

        await tx.activityLog.create({
          data: {
            userId: ctx.session.user.id,
            projectId: input.projectId,
            sprintId: sprint.id,
            activityType: ActivityType.SprintCompleted,
            description: `Sprint [${sprint.name}] was completed`,
            newValue: JSON.stringify(sprint),
          },
        });

        return sprint;
      });
    }),

  getCurrentSprint: projectMemberProcedure.query(async ({ ctx }) => {
    return ctx.db.sprint.findFirst({
      where: { projectId: ctx.projectId, isActive: true },
      include: { tasks: true },
    });
  }),
});

export type SprintRouterOutput = inferRouterOutputs<typeof sprintRouter>;

export default sprintRouter;
