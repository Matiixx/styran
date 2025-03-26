"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

const weeklyActivityData = [
  { day: "Mon", tasksCreated: 5, tasksCompleted: 3 },
  { day: "Tue", tasksCreated: 7, tasksCompleted: 5 },
  { day: "Wed", tasksCreated: 4, tasksCompleted: 9 },
  { day: "Thu", tasksCreated: 8, tasksCompleted: 4 },
  { day: "Fri", tasksCreated: 6, tasksCompleted: 7 },
  { day: "Sat", tasksCreated: 2, tasksCompleted: 0 },
  { day: "Sun", tasksCreated: 1, tasksCompleted: 2 },
];

const ProjectActivityOverview = () => {
  return (
    <Card disableHover>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Activity Overview</CardTitle>
        <Tabs defaultValue="7-days">
          <TabsList>
            <TabsTrigger value="7-days">Last 7 days</TabsTrigger>
            <TabsTrigger value="30-days">Last 30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="h-80 w-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={weeklyActivityData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="tasksCreated"
              stroke="#c084fc"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Tasks Created"
            />
            <Line
              type="monotone"
              dataKey="tasksCompleted"
              stroke="#34d399"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Tasks Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProjectActivityOverview;
