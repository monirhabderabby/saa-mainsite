"use client";

import { Badge } from "@/components/ui/badge";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ProjectPhaseStatus } from "@prisma/client";
import { Check, Circle, Loader2 } from "lucide-react";
import Image from "next/image";

export interface PhaseCardProps {
  phaseNumber: number;
  title: string;
  deliverable: string;
  points: number;
  status: ProjectPhaseStatus;
  className?: string;
  instructionSheet?: string;
  orderId?: string;
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
  instructionSheet,
  orderId,
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
      {/* <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800">
          Phase {phaseNumber}: {title}
        </h3>
        <p className="text-sm text-slate-500 truncate">
          Will deliver: {deliverable}
        </p>
      </div> */}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800">
          Phase {phaseNumber}: {title}
        </h3>

        {orderId && (
          <p className="text-xs text-slate-400">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}

        <p className="text-sm text-slate-500 truncate">
          Will deliver: {deliverable}
        </p>
      </div>

      {instructionSheet && (
        <div>
          <a href={instructionSheet} target="_blank">
            <Badge variant="outline" className="flex gap-x-1">
              <Image
                src={icons.Sheet}
                alt="spreadsheet"
                width={10}
                height={10}
              />
              Instruction Sheet
            </Badge>
          </a>
        </div>
      )}

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
