import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type SelectRangeEventHandler } from "react-day-picker";

import { cn } from "~/lib/utils";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar, type CalendarProps } from "./calendar";

type DatePickerProps = {
  date: Date | undefined;
  className?: string;
  setDate: (date: Date | undefined) => void;
} & Pick<CalendarProps, "minDate" | "maxDate">;

export const DatePicker = ({
  date,
  minDate,
  maxDate,
  className,
  setDate,
}: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
};

type DatePickerRangeProps = {
  dateRange: { from: Date | undefined; to: Date | undefined };
  className?: string;
  setDateRange: SelectRangeEventHandler;
} & Pick<CalendarProps, "minDate" | "maxDate">;

export const DatePickerRange = ({
  dateRange,
  setDateRange,
  className,
  minDate,
  maxDate,
}: DatePickerRangeProps) => {
  const { from, to } = dateRange;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from ? (
            to ? (
              <>
                {format(from, "P")} - {format(to, "P")}
              </>
            ) : (
              format(from, "P")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={setDateRange}
          initialFocus
          numberOfMonths={2}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
};
