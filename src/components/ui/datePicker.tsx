import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
