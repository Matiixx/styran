import { test } from "vitest";

import map from "lodash/map";
import padStart from "lodash/padStart";

import { db } from "./db";
import { Printer } from "lucide-react";

test("update task tickers", async () => {
  return;

  // const tasks = await db.task.findMany({
  //   include: { project: { select: { ticker: true } } },
  // });

  // await Promise.all(
  //   map(tasks, (task, index) =>
  //     db.task.update({
  //       where: { id: task.id },
  //       data: { ticker: generateTaskTicker(task.project.ticker, index) },
  //     }),
  //   ),
  // );
});

test("update project timezone", async () => {
  // const projects = await db.project.findMany({
  //   select: {
  //     id: true,
  //     timezone: true,
  //   },
  // });
  // await Promise.all(
  //   map(projects, (project) => {
  //     return db.project.update({
  //       where: { id: project.id },
  //       data: { timezone: 1 },
  //     });
  //   }),
  // );
});

export const generateTaskTicker = (
  projectTicker: string,
  taskCount: number,
) => {
  const paddedTaskCount = padStart(`${taskCount + 1}`, 3, "0");
  return `${projectTicker}-${paddedTaskCount}`;
};
