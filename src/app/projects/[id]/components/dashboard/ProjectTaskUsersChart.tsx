"use client";

import { Cell, Legend, Pie, PieChart } from "recharts";

import values from "lodash/values";

import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  renderCustomizedLabel,
} from "~/components/ui/chart";
import { stringToRGB } from "../../calendar/utils";

type ProjectTaskUsersChartProps = {
  data: Record<
    string,
    {
      asigneeId: string;
      count: number;
      user: NonNullable<TasksRouterOutput["getTasksByUser"][number]["asignee"]>;
    }
  >;
};

const ProjectTaskUsersChart = ({ data }: ProjectTaskUsersChartProps) => {
  const dataArray = values(data);
  return (
    <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
      <PieChart>
        <Pie
          data={dataArray}
          dataKey="count"
          cx="50%"
          cy="50%"
          nameKey="user.id"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={5}
          label={renderCustomizedLabel(({ name: userId, value }) => {
            const user = data[userId]?.user;
            return `${user?.firstName}: ${value}`;
          })}
        >
          {dataArray.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={stringToRGB(entry.user.email).background}
            />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideName
              indicator="line"
              labelFormatter={(_, payload) => {
                const userId = payload?.[0]?.name as string;
                const user = data[userId]?.user;
                return `${user?.firstName} ${user?.lastName}`;
              }}
            />
          }
        />
        <Legend
          payload={dataArray.map((entry) => ({
            value: `${entry.user.firstName} ${entry.user.lastName}`,
            color: stringToRGB(entry.user.email).background,
          }))}
        />
      </PieChart>
    </ChartContainer>
  );
};

export { ProjectTaskUsersChart };
