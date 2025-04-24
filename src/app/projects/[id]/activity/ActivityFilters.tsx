"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { type SelectRangeEventHandler } from "react-day-picker";
import Link from "next/link";
import { useRouter } from "next/navigation";

import debounce from "lodash/debounce";
import map from "lodash/map";

import dayjs, { type Dayjs } from "~/utils/dayjs";
import { ActivityType } from "~/lib/schemas/activityType";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePickerRange } from "~/components/ui/datePicker";
import { InputWithLabel } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { getActivityTypeLabel } from "./activityUtils";

type DateRange = {
  from: Dayjs | undefined;
  to: Dayjs | undefined;
};

export type ActivityFiltersParams = Partial<{
  from: string;
  to: string;
  type: string;
  user: string;
  search: string;
  page: string;
}>;

const ActivityFilters = ({
  users,
  projectId,
}: {
  users: ProjectRouterOutput["getProjectMembers"];
  projectId: string;
}) => {
  const router = useRouter();

  const [filters, setFilters] = useState<{
    search: string;
    type: ActivityType | "all" | undefined;
    user: string | undefined;
    dateRange?: DateRange;
  }>({
    search: "",
    type: "all",
    user: "all",
    dateRange: { from: undefined, to: undefined },
  });

  const updateUrlParams = useCallback(
    debounce((currentFilters: typeof filters) => {
      const params = new URLSearchParams();

      if (currentFilters.search) {
        params.set("search", currentFilters.search);
      }

      if (currentFilters.type && currentFilters.type !== "all") {
        params.set("type", currentFilters.type);
      }

      if (currentFilters.user && currentFilters.user !== "all") {
        params.set("user", currentFilters.user);
      }

      if (currentFilters.dateRange?.from) {
        params.set("from", currentFilters.dateRange.from.valueOf().toString());
      }

      if (currentFilters.dateRange?.to) {
        params.set("to", currentFilters.dateRange.to.valueOf().toString());
      }

      router.push(`/projects/${projectId}/activity?${params.toString()}`);
    }, 300),
    [projectId, router],
  );

  const updateFilter = useCallback(
    <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [filters, updateUrlParams],
  );

  const handleDateRangeChange: SelectRangeEventHandler = (range) => {
    const newDateRange = !range
      ? undefined
      : {
          from: range.from ? dayjs(range.from) : undefined,
          to: range.to ? dayjs(range.to) : undefined,
        };

    updateFilter("dateRange", newDateRange);
  };

  const clearFilters = () => {
    const newFilters = {
      search: "",
      type: "all",
      user: "all",
      dateRange: { from: undefined, to: undefined },
    } as const;
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  return (
    <Card disableHover>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Link href={`/projects/${projectId}/activity`}>
          <Button variant="ghost" onClick={clearFilters}>
            <X />
            Clear filters
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InputWithLabel
            label="Search"
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.currentTarget.value)}
          />
          <div>
            <Label>Activity type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                updateFilter("type", value as ActivityType | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All types </SelectItem>
                {map(ActivityType, (type) => (
                  <SelectItem key={type} value={type}>
                    {getActivityTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>User</Label>
            <Select
              value={filters.user}
              onValueChange={(value) => updateFilter("user", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date Range</Label>
            <DatePickerRange
              dateRange={{
                from: filters.dateRange?.from?.toDate(),
                to: filters.dateRange?.to?.toDate(),
              }}
              setDateRange={handleDateRangeChange}
              className="w-full overflow-hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFilters;
