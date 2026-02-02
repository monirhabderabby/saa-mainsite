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

function formatDate(date: Date | string | undefined) {
  if (!date) return "";

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (val: Date | undefined | string) => void;
}

export default function SmartDatePicker({
  label,
  value,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Local input state for free typing
  const [inputValue, setInputValue] = React.useState(
    value ? formatDate(value) : "",
  );

  const [month, setMonth] = React.useState<Date | undefined>(value);

  // Keep local state in sync when parent resets or updates value
  React.useEffect(() => {
    setInputValue(value ? formatDate(value) : ""); // <-- sync input with parent
    setMonth(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      {label && <Label htmlFor="date">{label}</Label>}
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder="Tomorrow or in 2 days"
          className="bg-background pr-10"
          onChange={(e) => {
            const text = e.target.value;
            setInputValue(text); // let user type freely
            const parsed = parseDate(text);
            onChange(parsed || undefined); // update parent form
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
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
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
    </div>
  );
}
