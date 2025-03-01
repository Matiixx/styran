import { test } from "vitest";

import map from "lodash/map";
import padStart from "lodash/padStart";

import { db } from "./db";

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

export const generateTaskTicker = (
  projectTicker: string,
  taskCount: number,
) => {
  const paddedTaskCount = padStart(`${taskCount + 1}`, 3, "0");
  return `${projectTicker}-${paddedTaskCount}`;
};
