"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 text-xs font-normal justify-between min-w-[130px] px-3",
            className,
          )}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selected.length === 1 ? (
              <span className="truncate">
                {options.find((o) => o.value === selected[0])?.label}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] rounded-sm"
                >
                  {selected.length}
                </Badge>
                <span className="text-muted-foreground">selected</span>
              </span>
            )}
          </span>

          <span className="flex items-center gap-0.5 shrink-0 ml-1">
            {selected.length > 0 && (
              <span
                role="button"
                onClick={clear}
                className="rounded-sm p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-1 w-44"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left",
                isSelected
                  ? "bg-primary/8 text-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "h-3.5 w-3.5 border rounded-sm flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-primary border-primary" : "border-border",
                )}
              >
                {isSelected && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </span>
              {opt.icon && (
                <span className="text-muted-foreground">{opt.icon}</span>
              )}
              {opt.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
