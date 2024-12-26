import { TaskStatus, TaskType } from "@prisma/client";
import { z } from "zod";

export const NewTaskSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(TaskType),
});

export const UNASSIGNED_USER_ID = "unassigned";

export const UpdateTaskSchema = z.object({
  taskId: z.string(),
  projectId: z.string(),
  type: z.nativeEnum(TaskType).optional(),
  title: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  startAt: z.date().optional(),
  doneAt: z.date().optional(),
});
