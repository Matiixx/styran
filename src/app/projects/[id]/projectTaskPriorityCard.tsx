"use client";

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
} from "~/components/ui/chart";
import { tailwindColors } from "~/styles/colors";

type ProjectTaskPriorityCardProps = {
  projectId: string;
};

const taskPriorityData = [
  { name: "None", tasks: 7, color: tailwindColors.gray[500] },
  { name: "Low", tasks: 18, color: tailwindColors.green[500] },
  { name: "Medium", tasks: 22, color: tailwindColors.yellow[500] },
  { name: "High", tasks: 15, color: tailwindColors.red[500] },
];

const ProjectTaskPriorityCard = ({
  projectId,
}: ProjectTaskPriorityCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task Priority</CardTitle>
        <CardDescription>
          Distribution of tasks by priority level
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
          <BarChart accessibilityLayer data={taskPriorityData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="tasks" radius={4}>
              {taskPriorityData.map((entry, index) => (
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
      </CardContent>
    </Card>
  );
};

export default ProjectTaskPriorityCard;
