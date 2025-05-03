"use client";

import { useMemo } from "react";

import { TaskStatus } from "@prisma/client";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { differenceInDays } from "date-fns";

import map from "lodash/map";
import range from "lodash/range";
import reduce from "lodash/reduce";
import round from "lodash/round";

import { type SprintRouterOutput } from "~/server/api/routers/sprint";

import dayjs from "~/utils/dayjs";

type BurndownChartProps = {
  sprint: NonNullable<SprintRouterOutput["getCurrentSprint"]>;
};

type ChartDataPoint = {
  dayString: string;
  actualEffort: number;
  estimatedEffort?: number;
};

const BurndownChart = ({ sprint }: BurndownChartProps) => {
  const data = useMemo(() => getBurndownData(sprint), [sprint]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dayString" />
        <YAxis />
        <Tooltip />
        <Line
          type="stepBefore"
          dataKey="actualEffort"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <Line
          type="linear"
          dataKey="estimatedEffort"
          stroke="#82ca9d"
          dot={false}
        />
        <Legend
          wrapperStyle={{ paddingTop: "8px" }}
          payload={[
            { value: "Actual", color: "#8884d8" },
            { value: "Estimated", color: "#82ca9d" },
          ]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const getBurndownData = (
  sprint: NonNullable<SprintRouterOutput["getCurrentSprint"]>,
): ChartDataPoint[] => {
  const sprintDuration = differenceInDays(sprint.endAt, sprint.startAt);

  const totalStoryPoints = reduce(
    sprint.tasks,
    (acc, task) => acc + (task.storyPoints ?? 0),
    0,
  );

  const data = map(range(sprintDuration), (_day) => {
    const day = dayjs(sprint.startAt).add(_day, "day");
    const storyPointsInDay = reduce(
      sprint.tasks,
      (acc, task) => {
        if (task.status === TaskStatus.DONE && day.isAfter(task.doneAt)) {
          return acc + (task.storyPoints ?? 0);
        }
        return acc;
      },
      0,
    );

    const estimatedEffort = round(
      totalStoryPoints - _day * (totalStoryPoints / (sprintDuration - 1)),
      2,
    );

    return {
      dayString: `Day ${_day + 1}`,
      actualEffort: totalStoryPoints - storyPointsInDay,
      estimatedEffort,
    };
  });

  return data;
};

export default BurndownChart;
