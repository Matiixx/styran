"use client";

import { type TaskPriority } from "@prisma/client";

import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

type ProjectPriorityChartProps = {
  taskPriorityData: {
    priority: TaskPriority;
    count: number;
    color: string;
  }[];
};

export const ProjectPriorityChart = ({
  taskPriorityData,
}: ProjectPriorityChartProps) => {
  return (
    <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
      <BarChart accessibilityLayer data={taskPriorityData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="priority" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideName
              indicator="line"
              labelFormatter={(
                _,
                payload: Array<{ payload?: { priority: TaskPriority } }>,
              ) => {
                const priority = payload?.[0]?.payload?.priority;
                return upperFirst(toLower(priority)) ?? "";
              }}
            />
          }
        />
        <Bar dataKey="count" radius={4}>
          {map(taskPriorityData, (entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList
            position="top"
            offset={6}
            className="fill-black"
            fontSize={14}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
