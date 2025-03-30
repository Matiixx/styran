"use client";

import { TaskStatus } from "@prisma/client";

import isEmpty from "lodash/isEmpty";

import { Cell, Legend, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  renderCustomizedLabel,
} from "~/components/ui/chart";
import { tailwindColors } from "~/styles/colors";
import { taskStatusToString } from "~/utils/taskUtils";

type TaskStatusData = {
  status: TaskStatus;
  _count: { status: number };
};

const CHART_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: tailwindColors.gray[400],
  [TaskStatus.IN_PROGRESS]: tailwindColors.blue[300],
  [TaskStatus.IN_REVIEW]: tailwindColors.blue[500],
  [TaskStatus.DONE]: tailwindColors.green[400],
};

type ProjectTaskStatusCardClientProps = {
  taskStatusData: TaskStatusData[];
};

const ProjectTaskStatusCardClient = ({
  taskStatusData,
}: ProjectTaskStatusCardClientProps) => {
  if (isEmpty(taskStatusData)) {
    return (
      <div className="mt-8 flex w-full items-center justify-center text-muted-foreground">
        No data to display yet
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
      <PieChart>
        <Pie
          data={taskStatusData}
          dataKey="_count.status"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={5}
          label={renderCustomizedLabel(
            ({ percent }) => `${(percent * 100).toFixed(0)}%`,
          )}
        >
          {taskStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLOR[entry.status]} />
          ))}
        </Pie>
        <ChartTooltip
          payload={taskStatusData.map((entry) => ({
            value: taskStatusToString(entry.status),
            color: CHART_COLOR[entry.status],
          }))}
          content={
            <ChartTooltipContent
              hideName
              indicator="line"
              labelFormatter={(
                _,
                payload: Array<{ payload?: TaskStatusData }>,
              ) => {
                const status = payload?.[0]?.payload?.status;
                return status ? taskStatusToString(status) : "";
              }}
            />
          }
        />
        <Legend
          payload={taskStatusData.map((entry) => ({
            value: taskStatusToString(entry.status),
            color: CHART_COLOR[entry.status],
          }))}
        />
      </PieChart>
    </ChartContainer>
  );
};

export default ProjectTaskStatusCardClient;
