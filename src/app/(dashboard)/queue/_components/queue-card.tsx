// components/queue/queueCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QueueWithRelations } from "@/hook/queues/use-get-queues";
import type { Queue } from "@/types/queue";
import { Role } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
  Link2,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
  User2,
} from "lucide-react";

interface QueueCardProps {
  queue: QueueWithRelations;
  userRole: Role;
  currentUserId: string;
  onSubmitLinks?: (queue: Queue) => void;
  onEdit?: (queue: Queue) => void;
  onDelete?: (queue: Queue) => void;
}

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Requested",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  GIVEN: {
    label: "Given",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
};

export function QueueCard({
  queue,
  userRole,
  currentUserId,
  onSubmitLinks,
  onEdit,
  onDelete,
}: QueueCardProps) {
  const status = STATUS_CONFIG[queue.status];
  const StatusIcon = status.icon;

  const isOwner = queue.requestedById === currentUserId;
  const isSales = userRole === "SALES_MEMBER" || userRole === "ADMIN";

  const canEdit = isOwner && queue.status === "REQUESTED";
  const canDelete = isOwner || userRole === "ADMIN";

  return (
    <div className="group relative flex flex-col gap-0 rounded-lg border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-150">
      {/* Top row */}
      <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Queue key badge */}
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-mono font-semibold text-primary border border-primary/15 shrink-0">
            <Hash className="h-2.5 w-2.5" />
            {queue.queueKey}
          </span>

          {/* Status */}
          <Badge
            variant="outline"
            className={`h-5 gap-1 px-1.5 text-[10px] font-medium ${status.className}`}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {status.label}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isSales && queue.status === "REQUESTED" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onSubmitLinks?.(queue)}
                  >
                    <Link2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Submit Links
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isSales && queue.status === "GIVEN" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onSubmitLinks?.(queue)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Edit Links
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs">
                {canEdit && (
                  <DropdownMenuItem
                    className="text-xs gap-2"
                    onClick={() => onEdit?.(queue)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    className="text-xs gap-2 text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(queue)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Client + Profile row */}
      <div className="px-4 pb-2 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <User2 className="h-3 w-3 text-muted-foreground shrink-0" />
          {queue.clientName}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{queue.profile.name}</span>
        </div>
        {queue.orderId && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3 shrink-0" />
            <span className="font-mono">{queue.orderId}</span>
          </div>
        )}
      </div>

      {/* Message */}
      <div className="px-4 pb-3">
        <p className="text-xs  font-medium leading-relaxed line-clamp-2">
          {queue.message}
        </p>
      </div>

      {/* Links section (only if Given) */}
      {queue.links.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {queue.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-500/15 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {link.title}
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 bg-muted/20 rounded-b-lg">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>By</span>
          <span className="font-medium text-foreground/70">
            {queue.requestedBy.fullName || queue.requestedBy.email}
          </span>
        </div>
        {queue.assignedTo && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Sales:</span>
            <span className="font-medium text-foreground/70">
              {queue.assignedTo.fullName || queue.assignedTo.email}
            </span>
          </div>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">
          {formatDistanceToNow(new Date(queue.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
