import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";

export const NewTaskSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(TaskType),
  customType: z.string().optional(),
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
  startAt: z.date().nullable().optional(),
  doneAt: z.date().nullable().optional(),
  storyPoints: z.number().nullable().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
});
