"use client";

const AddProjectPhase = dynamic(
  () => import("@/components/shared/modal/add-project-phase"),
  {
    ssr: false,
  },
);
import { deletePhase } from "@/actions/tools/fsd-projects/phase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { projectPhase, ProjectPhaseStatus } from "@prisma/client";
import { Check, Circle, EllipsisVertical, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export interface PhaseCardProps {
  phaseNumber: number;
  title: string;
  deliverable: string;
  points: number;
  status: ProjectPhaseStatus;
  className?: string;
  instructionSheet?: string;
  orderId?: string;
  projectId: string;
  data: projectPhase;
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
  projectId,
  data,
}: PhaseCardProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const config =
    statusConfig[status.toLowerCase() as keyof typeof statusConfig];
  const Icon = config.icon;

  const onDeletePhase = () => {
    startTransition(() => {
      deletePhase(data.id, projectId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }
        toast.success(res.message);
        setDeleteModalOpen(false);
      });
    });
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-4 rounded-xl border p-4 transition-all",
          "hover:shadow-sm",
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
        <div
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "opacity-0 translate-x-2",
            "transition-all duration-200 ease-out",
            "group-hover:opacity-100 group-hover:translate-x-0",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background shadow-sm"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setOpen((p) => !p)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setDeleteModalOpen((p) => !p)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {open && (
        <AddProjectPhase
          projectId={projectId}
          initialdata={data}
          defaultOpen={open}
        />
      )}

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDeletePhase}
        loading={isPending}
        title="Delete this phase?"
        message="This action will permanently delete the phase and all associated data. This cannot be undone."
      />
    </>
  );
}
