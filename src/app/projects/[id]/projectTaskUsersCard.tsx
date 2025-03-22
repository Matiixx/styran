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
import { stringToRGB } from "./calendar/utils";

type ProjectTaskUsersCardProps = {
  projectId: string;
};

const tasksByUserData = [
  { name: "Jane S.", value: 14, color: stringToRGB("Jane S.").background },
  { name: "Mike J.", value: 8, color: stringToRGB("Mike J.").background },
  { name: "Anna K.", value: 12, color: stringToRGB("Anna K.").background },
  { name: "Tom B.", value: 10, color: stringToRGB("Tom B.").background },
  { name: "Lisa W.", value: 6, color: stringToRGB("Lisa W.").background },
];

const ProjectTaskUsersCard = ({ projectId }: ProjectTaskUsersCardProps) => {
  return (
    <Card disableHover className="flex-1 text-black">
      <CardHeader>
        <CardTitle>Task by User</CardTitle>
        <CardDescription>
          Distribution of tasks among team members
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={{}} className="mx-auto h-[350px] w-full">
          <PieChart>
            <Pie
              data={tasksByUserData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              label={renderCustomizedLabel(
                ({ name, value }) => `${name}: ${value}`,
              )}
            >
              {tasksByUserData.map((entry, index) => (
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

export default ProjectTaskUsersCard;
