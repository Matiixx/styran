"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { type SelectRangeEventHandler } from "react-day-picker";
import Link from "next/link";

import dayjs, { type Dayjs } from "~/utils/dayjs";

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

type DateRange = {
  from: Dayjs | undefined;
  to: Dayjs | undefined;
};

export type ActivityFiltersParams = Partial<{
  from: string;
  to: string;
  type: string;
  user: string;
  page: string;
}>;

const ActivityFilters = ({ projectId }: { projectId: string }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dayjs(),
    to: dayjs().add(7, "day"),
  });

  const handleDateRangeChange: SelectRangeEventHandler = (range) => {
    if (!range) {
      setDateRange(undefined);
      return;
    }

    setDateRange({
      from: range.from ? dayjs(range.from) : undefined,
      to: range.to ? dayjs(range.to) : undefined,
    });
  };

  return (
    <Card disableHover>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Link href={`/projects/${projectId}/activity`}>
          <Button variant="ghost">
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
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div>
            <Label>Activity type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>User</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date Range</Label>
            <DatePickerRange
              dateRange={{
                from: dateRange?.from?.toDate(),
                to: dateRange?.to?.toDate(),
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
