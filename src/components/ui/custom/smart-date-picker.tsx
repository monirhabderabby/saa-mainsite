"use client";

import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (val: Date | undefined) => void;
}

export default function DatePicker({
  label,
  value,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    value ? formatDate(value) : ""
  );
  const [month, setMonth] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    if (value) {
      setInputValue(formatDate(value)); // keep input synced when controlled externally
      setMonth(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder="Tomorrow or in 2 days"
          className="bg-background pr-10"
          onChange={(e) => {
            const text = e.target.value;
            setInputValue(text);
            const parsed = parseDate(text);
            onChange(parsed || undefined);
            if (parsed) setMonth(parsed);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                onChange(date);
                setInputValue(date ? formatDate(date) : "");
                setMonth(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* {value && (
        <div className="text-muted-foreground px-1 text-sm">
          Parsed date: <span className="font-medium">{formatDate(value)}</span>
        </div>
      )} */}
    </div>
  );
}
