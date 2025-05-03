"use client";

import { useMemo } from "react";

import map from "lodash/map";
import reduce from "lodash/reduce";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { type SprintRouterOutput } from "~/server/api/routers/sprint";
import { tailwindColors } from "~/styles/colors";

import { stringToRGB } from "../../calendar/utils";

type PointsArrangementChartProps = {
  users: ProjectRouterOutput["getProjectMembers"];
  sprint: NonNullable<SprintRouterOutput["getCurrentSprint"]>;
};

const PointsArrangementChart = ({
  users,
  sprint,
}: PointsArrangementChartProps) => {
  const data = useMemo(
    () => getSprintPointsArrangement(sprint, users),
    [sprint, users],
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="Story Points">
          {map(data, (entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const getSprintPointsArrangement = (
  sprint: NonNullable<SprintRouterOutput["getCurrentSprint"]>,
  users: ProjectRouterOutput["getProjectMembers"],
) => {
  const storyPointsPerUser = reduce(
    sprint.tasks,
    (acc, task) => {
      if (task.storyPoints) {
        if (task.asigneeId) {
          acc[task.asigneeId] = (acc[task.asigneeId] || 0) + task.storyPoints;
        } else {
          acc.unassigned = (acc.unassigned || 0) + task.storyPoints;
        }
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return map(storyPointsPerUser, (points, uid) => {
    const user = users.find((user) => user.id === uid);
    const isUnassigned = uid === "unassigned";

    const userName = isUnassigned
      ? "Unassigned"
      : `${user?.firstName} ${user?.lastName}`;

    const color = isUnassigned
      ? tailwindColors.gray[400]
      : stringToRGB(user?.email ?? "").background;

    return {
      name: userName,
      color,
      "Story Points": points,
      isUnassigned: uid === "unassigned",
    };
  }).sort((a, b) => {
    if (a.isUnassigned) return 1;
    if (b.isUnassigned) return -1;
    return 0;
  });
};

export default PointsArrangementChart;
