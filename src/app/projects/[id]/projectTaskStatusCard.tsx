"use client";

import { Cell, Legend, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  renderCustomizedLabel,
} from "~/components/ui/chart";
import { tailwindColors } from "~/styles/colors";

type ProjectTaskStatusCardProps = {
  projectId: string;
};

const taskStatusData = [
  { name: "To Do", value: 18, color: tailwindColors.gray[400] },
  { name: "In Progress", value: 12, color: tailwindColors.blue[300] },
  { name: "Review", value: 8, color: tailwindColors.blue[500] },
  { name: "Done", value: 24, color: tailwindColors.green[400] },
];

const ProjectTaskStatusCard = ({ projectId }: ProjectTaskStatusCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task Status</CardTitle>
        <CardDescription>
          Distribution of tasks by current status
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
          <PieChart>
            <Pie
              data={taskStatusData}
              dataKey="value"
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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProjectTaskStatusCard;
