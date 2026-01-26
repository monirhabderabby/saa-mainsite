"use client";

import { cn } from "@/lib/utils";
import { ProjectPhaseStatus } from "@prisma/client";
import { Check, Circle, Loader2 } from "lucide-react";

export interface PhaseCardProps {
  phaseNumber: number;
  title: string;
  deliverable: string;
  points: number;
  status: ProjectPhaseStatus;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: Check,
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    statusText: "Completed",
    statusColor: "text-emerald-500",
    cardBg: "bg-emerald-50/50",
    borderColor: "border-emerald-100",
  },
  running: {
    icon: Loader2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    statusText: "In Progress",
    statusColor: "text-orange-500",
    cardBg: "bg-sky-50/50",
    borderColor: "border-sky-100",
  },
  pending: {
    icon: Circle,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    statusText: "Pending",
    statusColor: "text-slate-400",
    cardBg: "bg-slate-50/30",
    borderColor: "border-slate-100",
  },
};

export function PhaseCard({
  phaseNumber,
  title,
  deliverable,
  points,
  status,
  className,
}: PhaseCardProps) {
  const config =
    statusConfig[status.toLowerCase() as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-all",
        config.cardBg,
        config.borderColor,
        className,
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          config.iconBg,
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            config.iconColor,
            status === "Running" && "animate-spin",
          )}
          strokeWidth={status === "Completed" ? 3 : 2}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800">
          Phase {phaseNumber}: {title}
        </h3>
        <p className="text-sm text-slate-500 truncate">
          Will deliver: {deliverable}
        </p>
      </div>

      {/* Points & Status */}
      <div className="text-right shrink-0">
        <p className="font-semibold text-slate-700">${points}</p>
        <p className={cn("text-sm font-medium", config.statusColor)}>
          {config.statusText}
        </p>
      </div>
    </div>
  );
}
