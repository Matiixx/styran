import { z } from "zod";

export enum TaskType {
  TASK = "task",
  BUG = "bug",
  FEATURE = "feature",
  STORY = "story",
}

export const NewTaskSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(TaskType),
});
