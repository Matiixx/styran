import { TaskPriority, type Task } from "@prisma/client";

import { type DiscordEmbed } from "~/server/integrations/discord/discord.d";

import {
  getColorByPriority,
  priorityToString,
  taskStatusToString,
} from "~/utils/taskUtils";
import { getDayInTimezone } from "~/utils/timeUtils";

const hexToDecimal = (hex: string) => {
  const hexWithoutHash = hex.replace("#", "");
  return parseInt(hexWithoutHash, 16);
};

const generateDiscordTaskEmbed = (
  task: Task & {
    asignee: { firstName: string; lastName: string } | null;
    timezone: number;
  },
): DiscordEmbed => {
  const assigneeMessage = task.asignee
    ? `Task is assigned to **${task.asignee.firstName} ${task.asignee.lastName}**\n\n`
    : "There is no assignee for this task!\n\n";

  const priorityColor = getColorByPriority(
    task.priority ?? TaskPriority.NONE,
  ).color;

  const description = task.description
    ? `**Description:** ${task.description}\n\n`
    : "";
  const priority = `**Priority:** ${priorityToString(task.priority)}\n\n`;
  const status = `**Status:** ${taskStatusToString(task.status)}\n\n`;
  const storyPoints =
    task.storyPoints !== null
      ? `**Story Points:** ${task.storyPoints}\n\n`
      : "";
  const deadline = `**Deadline:** ${getDayInTimezone(task.doneAt!, task.timezone).format("DD.MM.YYYY HH:mm")}`;
  const url = `${process.env.APP_URL}/projects/${task.projectId}/backlog/task/${task.id}`;

  return {
    url,
    color: hexToDecimal(priorityColor),
    title: `[${task.ticker}] ${task.title}`,
    description: `${assigneeMessage}${description}${priority}${status}${storyPoints}${deadline}`,
  };
};

export { generateDiscordTaskEmbed };
