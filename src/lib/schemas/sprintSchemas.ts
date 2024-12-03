import { z } from "zod";

export const StartSprintSchema = z.object({
  name: z.string().min(3),
  goal: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  includeTasksFromBacklog: z.boolean(),
});
