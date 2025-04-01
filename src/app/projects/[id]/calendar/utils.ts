import { type Event } from "react-big-calendar";
import stc from "string-to-color";

import dayjs from "~/utils/dayjs";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

type Task = TasksRouterOutput["getTasks"][number];
type Sprint = NonNullable<ProjectRouterOutput["getProject"]>["sprint"];

interface TaskEvent extends Event {
  start: Date;
  end: Date;
  resource: { id: string };
}

const sprintToCalendarEvent = (
  sprint: Sprint | undefined,
): TaskEvent | null => {
  if (!sprint?.[0]) return null;

  const currentSprint = sprint[0];

  return {
    title: currentSprint.name,
    start: dayjs(currentSprint.startAt).toDate(),
    end: dayjs(currentSprint.endAt).toDate(),
    resource: { id: currentSprint.id },
  };
};

const taskToCalendarEvent = (task: Task): TaskEvent => {
  return {
    title: `[${task.ticker}] ${task.title}`,
    start: dayjs(task.startAt).toDate(),
    end: task.doneAt ? dayjs(task.doneAt).toDate() : dayjs().toDate(),
    resource: { id: task.id },
  };
};

const contrastColor = (hex: string) => {
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hex = hex[0]! + hex[0]! + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  const r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  // https://stackoverflow.com/a/3943023/112731
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
};

const stringToRGB = (str: string) => {
  if (str.length === 0) return { background: "#000000", foreground: "#FFFFFF" };
  const background = stc(str);
  return { background, foreground: contrastColor(background) };
};

export {
  taskToCalendarEvent,
  sprintToCalendarEvent,
  type TaskEvent,
  stringToRGB,
};
