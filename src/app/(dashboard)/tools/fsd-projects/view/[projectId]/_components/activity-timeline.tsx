"use client";

import { AuditLogWithActor } from "@/app/api/auditLog/route";
import { useQuery } from "@tanstack/react-query";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AuditAction } from "@prisma/client";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import moment from "moment";

interface Props {
  projectId: string;
}

const statusConfig = {
  NRA: {
    label: "Not Ready",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  WIP: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  Revision: {
    label: "Revision",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

const ACTION_CONFIG: Record<AuditAction, ActionConfig> = {
  CREATE: {
    label: "created a new project",
    icon: Plus,
    dotColor: "bg-emerald-500",
  },
  UPDATE: {
    label: "updated",
    icon: Pencil,
    dotColor: "bg-amber-500",
  },
  DELETE: {
    label: "deleted",
    icon: Trash2,
    dotColor: "bg-red-500",
  },
  STATUS_CHANGE: {
    label: "updated status in",
    icon: RefreshCw,
    dotColor: "bg-blue-500",
  },
  DELIVERY_SENT: {
    label: "sent a delivery for",
    icon: Send,
    dotColor: "bg-violet-500",
  },
  UPDATE_SENT: {
    label: "sent an update for",
    icon: Mail,
    dotColor: "bg-teal-500",
  },
  COMMENT_ADDED: {
    label: "added a comment on",
    icon: MessageSquare,
    dotColor: "bg-emerald-500",
  },
};

function ActivityItem({ log }: { log: AuditLogWithActor }) {
  const config = ACTION_CONFIG[log.action];
  const Icon = config.icon;
  const entityTitle =
    (log.meta as Record<string, string> | null)?.entityTitle ?? "Untitled";
  // const reason =
  //   (log.meta as Record<string, string> | null)?.reason ?? "Untitled";
  const comment = (log.meta as Record<string, string> | null)?.comment ?? null;
  const description =
    (log.meta as Record<string, string> | null)?.description ?? null;
  const changes = log.changes as Record<string, unknown> | null;
  const status = (log.meta as Record<string, string> | null)?.status ?? null;
  const orderId = (log.meta as Record<string, string> | null)?.orderId ?? null;
  const profile = (log.meta as Record<string, string> | null)?.profile ?? null;

  return (
    <div className="flex gap-4 py-5">
      <Avatar className="h-10 w-10 shrink-0 mt-0.5">
        {log.actor?.image && (
          <AvatarImage
            src={log.actor.image || "/placeholder.svg"}
            alt={log.actor.fullName ?? "User"}
          />
        )}
        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
          {log.actor?.fullName ? getInitials(log.actor.fullName) : "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header line */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          <span className="font-semibold text-foreground">
            {log.actor?.fullName ?? "Unknown User"}
          </span>
          <span className="text-muted-foreground">{config.label}</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {entityTitle}
          </span>
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full shrink-0",
              config.dotColor,
            )}
            aria-hidden="true"
          />
          <span className="text-muted-foreground text-xs">
            {moment(log.createdAt).fromNow()}
          </span>
        </div>
        {log.action === "CREATE"}{" "}
        {
          <div className="mt-2 flex items-center gap-2">
            {/* Metadata row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[8px] px-1 py-0.5 font-normal",
                  statusConfig[status as keyof typeof statusConfig].color,
                )}
              >
                {statusConfig[status as keyof typeof statusConfig].label}
              </Badge>

              <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {profile}
              </span>

              {orderId && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  #{orderId}
                </span>
              )}
            </div>
          </div>
        }
        {/* Status change detail */}
        {log.action === "STATUS_CHANGE" && changes && (
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-medium"
            >
              {String(changes.from)}
            </Badge>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-medium"
            >
              {String(changes.to)}
            </Badge>
          </div>
        )}
        {/* Comment detail */}
        {log.action === "COMMENT_ADDED" && comment && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {`"${comment}"`}
          </p>
        )}
        {/* Generic description */}
        {log.action !== "COMMENT_ADDED" &&
          log.action !== "STATUS_CHANGE" &&
          description && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
      </div>

      <div className="shrink-0 mt-1">
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 py-5">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

const ActivityTimeline = ({ projectId }: Props) => {
  const { data, isLoading, isError } = useQuery<AuditLogWithActor[]>({
    queryKey: ["auditLog", "project", projectId],
    queryFn: () =>
      fetch(`/api/auditLog?entity=project&entityId=${projectId}`).then((res) =>
        res.json(),
      ),
  });

  let content;

  if (isLoading) {
    content = (
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Failed to load activity. Please try again.
      </div>
    );
  } else if (data?.length === 0) {
    content = (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No activity found for this project.
      </div>
    );
  } else if (data && data?.length > 0) {
    content = (
      <div className="divide-y divide-border">
        {data.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </div>
    );
  }
  return <div>{content}</div>;
};

export default ActivityTimeline;
