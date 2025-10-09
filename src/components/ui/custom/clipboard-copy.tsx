"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import UpdateToBadge, { UpdateTo } from "../update-to-badge";

interface ClipboardCopyProps {
  label: string;
  value: string;
  className?: string;
  clipboard?: boolean;
  badge?: boolean;
}

export function ClipboardCopy({
  label,
  value,
  className,
  clipboard,
  badge,
}: ClipboardCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {badge ? (
            <UpdateToBadge updateTo={value as UpdateTo} />
          ) : (
            <span className="text-sm font-mono text-foreground">{value}</span>
          )}

          {clipboard && (
            <button
              onClick={handleCopy}
              className="relative p-1 rounded-md hover:bg-muted transition-colors duration-200 focus:outline-none "
              aria-label={copied ? "Copied!" : "Copy to clipboard"}
            >
              <div className="relative w-4 h-4">
                <Copy
                  className={cn(
                    "absolute inset-0 w-4 h-4 text-muted-foreground transition-all duration-300",
                    copied
                      ? "scale-0 opacity-0 rotate-180"
                      : "scale-100 opacity-100 rotate-0"
                  )}
                />
                <Check
                  className={cn(
                    "absolute inset-0 w-4 h-4 text-green-600 transition-all duration-300",
                    copied
                      ? "scale-100 opacity-100 rotate-0"
                      : "scale-0 opacity-0 rotate-180"
                  )}
                />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
