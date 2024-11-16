import { TaskType } from "@prisma/client";
import { z } from "zod";

export const NewTaskSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(TaskType),
});
