"use client";

import { useMemo } from "react";
import {
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Legend,
  type TooltipProps,
} from "recharts";

import last from "lodash/last";
import map from "lodash/map";
import reduce from "lodash/reduce";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import dayjs, { type Dayjs } from "~/utils/dayjs";
import { getCurrentDayInTimezone } from "~/utils/timeUtils";
import { stringToRGB } from "../../calendar/utils";

const DailyUtilizationChart = ({
  usersUtilization,
}: {
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"];
}) => {
  const groupedUsersUtilization = useMemo(
    () => groupUtilzationByDay(usersUtilization),
    [usersUtilization],
  );

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart
        data={groupedUsersUtilization}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dayString" />
        <YAxis allowDecimals={false} domain={["dataMin", "dataMax"]} />
        <Tooltip content={<CustomTooltip />} />

        {map(groupedUsersUtilization, (dayData, index) => (
          <Line
            key={dayData.dayString}
            type="linear"
            dataKey={`users[${index}].utilization`}
            stroke={dayData.users[index]?.color}
            strokeWidth={2}
          />
        ))}
        <Legend
          wrapperStyle={{ paddingTop: "8px" }}
          payload={last(groupedUsersUtilization)?.users.map((user) => {
            return {
              value: `${user.firstName} ${user.lastName}`,
              color: user.color,
            };
          })}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    return (
      <div className="flex flex-col border border-gray-400 bg-white p-4">
        <span className="text-sm font-medium">{label}</span>
        {payload.map((item, index) => {
          return (
            <div key={item.name} className="flex flex-row items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">
                {item.payload.users[index].firstName}{" "}
                {item.payload.users[index].lastName}
              </span>
              <span className="text-sm text-gray-500">
                {item.payload.users[index].utilization.toFixed(2)}h
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const groupUtilzationByDay = (
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"],
): Array<{
  users: {
    utilization: number;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    color: string;
  }[];
  day: Dayjs;
  dayString: string;
}> => {
  // TODO: get timezone of the project
  const today = getCurrentDayInTimezone(2);
  const startWeek = today.startOf("week").add(1, "day");

  const days = [];

  for (let i = 0; i < 7; i++) {
    days.push(startWeek.clone().add(i, "day"));
  }

  const dailyUtilization = days.map((day) => ({
    day,
    dayString: day.format("DD/MM/YYYY"),
    users: usersUtilization.map((user) => {
      const dayTimeTracking = user.TimeTrack.filter((track) => {
        const trackStartDay = dayjs(track.startTime).startOf("day");
        return trackStartDay.isSame(day.startOf("day"), "day");
      });

      const totalTrackedMillis = reduce(
        dayTimeTracking,
        (acc, track) => {
          const startTime = dayjs(track.startTime);
          const endTime = track.endTime ? dayjs(track.endTime) : dayjs();
          return acc + endTime.diff(startTime, "milliseconds");
        },
        0,
      );

      const utilization = totalTrackedMillis / (1000 * 60 * 60);

      return {
        utilization,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        color: stringToRGB(user.email).background,
      };
    }),
  }));

  // Now create cumulative results
  const result = dailyUtilization.map((dayData, dayIndex) => {
    return {
      ...dayData,
      users: dayData.users.map((user) => {
        let cumulativeUtilization = 0;
        for (let i = 0; i <= dayIndex; i++) {
          const previousDayUser = dailyUtilization[i]?.users.find(
            (u) => u.userId === user.userId,
          );
          if (previousDayUser) {
            cumulativeUtilization += previousDayUser.utilization;
          }
        }

        return {
          ...user,
          utilization: cumulativeUtilization,
        };
      }),
    };
  });

  return result;
};

export default DailyUtilizationChart;
