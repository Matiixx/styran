"use client";

import { useMemo, useState } from "react";

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
import filter from "lodash/filter";

import { api } from "~/trpc/react";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import dayjs from "~/utils/dayjs";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type ProjectActivityOverviewClientProps = {
  projectId: string;
};

enum Days {
  WEEK = "7-days",
  MONTH = "30-days",
}

const ProjectActivityOverviewClient = ({
  projectId,
}: ProjectActivityOverviewClientProps) => {
  const [selectedDays, setSelectedDays] = useState<Days>(Days.WEEK);
  const { data } = api.tasks.getActivityOverview.useQuery({
    projectId,
    days: selectedDays === Days.WEEK ? "7" : "30",
  });

  const weeklyActivityData = useMemo(
    () => parseActivityData(data ?? [], selectedDays),
    [data, selectedDays],
  );

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Activity Overview</CardTitle>
        <Tabs
          value={selectedDays}
          onValueChange={(value) => {
            setSelectedDays(value as Days);
          }}
        >
          <TabsList>
            <TabsTrigger value={Days.WEEK}>Last 7 days</TabsTrigger>
            <TabsTrigger value={Days.MONTH}>Last 30 days</TabsTrigger>
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
            <YAxis allowDecimals={false} domain={["dataMin", "dataMax"]} />
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
    </>
  );
};

const parseActivityData = (
  data: TasksRouterOutput["getActivityOverview"],
  _days: Days,
) => {
  const now = dayjs();
  const parsedData = [];
  const days = _days === Days.WEEK ? 7 : 30;

  for (let i = days - 1; i >= 0; i--) {
    const day = now.subtract(i, "day");

    const tasksCreated = filter(
      data,
      (task) =>
        dayjs(task.createdAt).isSame(day, "day") &&
        (!task.doneAt || task.status !== "DONE"),
    ).length;

    const tasksCompleted = filter(
      data,
      (task) => dayjs(task.doneAt).isSame(day, "day") && task.status === "DONE",
    ).length;

    parsedData.push({
      day: days === 7 ? day.format("ddd") : day.format("MMM D"),
      tasksCreated,
      tasksCompleted,
    });
  }

  return parsedData;
};

export default ProjectActivityOverviewClient;
