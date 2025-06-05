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
import sortBy from "lodash/sortBy";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import dayjs, { type Dayjs } from "~/utils/dayjs";
import { stringToRGB } from "../../calendar/utils";

const DailyUtilizationChart = ({
  startDate,
  daysDuration,
  usersUtilization,
}: {
  startDate: Date;
  daysDuration: number;
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"];
}) => {
  const { data: groupedUsersUtilization, domain: YAxisDomain } = useMemo(
    () => groupUtilzationByDay(startDate, daysDuration, usersUtilization),
    [startDate, daysDuration, usersUtilization],
  );

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart
        data={groupedUsersUtilization}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dayString" />
        <YAxis allowDecimals={false} domain={YAxisDomain} />
        <Tooltip content={<CustomTooltip />} />

        {map(groupedUsersUtilization, (dayData, index) => (
          <Line
            key={dayData.dayString}
            type="stepAfter"
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
    const sortedUsers = sortBy(
      (payload[0]!.payload as { users: UserUtilization[] }).users,
      (user) => {
        return -user.utilization;
      },
    );

    return (
      <div className="flex flex-col border border-gray-400 bg-white p-4">
        <span className="text-sm font-medium">{label}</span>
        {payload.map((_, index) => {
          const user = sortedUsers[index]!;

          return (
            <div key={user.userId} className="flex flex-row items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-sm text-gray-500">
                {user.utilization.toFixed(2)}hrs
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

type UserUtilization = {
  utilization: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  color: string;
};

const groupUtilzationByDay = (
  startDate: Date,
  daysDuration: number,
  usersUtilization: ProjectRouterOutput["getProjectResourceUtilization"],
): {
  data: Array<{
    users: UserUtilization[];
    day: Dayjs;
    dayString: string;
  }>;
  domain: [number, number];
} => {
  const days = [];
  const startDay = dayjs(startDate);

  for (let i = 0; i < daysDuration; i++) {
    days.push(startDay.clone().add(i, "day"));
  }

  const dailyUtilization = days.map((day) => ({
    day,
    dayString: day.format("L"),
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

  const maxUtilization = Math.max(
    ...result.flatMap((dayData) =>
      dayData.users.map((user) => user.utilization),
    ),
  );

  return {
    data: result,
    domain: [0, Math.ceil(maxUtilization)] as [number, number],
  };
};

export default DailyUtilizationChart;
