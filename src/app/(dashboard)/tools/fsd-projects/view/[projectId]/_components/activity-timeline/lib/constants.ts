import { AuditAction } from "@prisma/client";
import {
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

interface ActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

export type StatusKey = "NRA" | "WIP" | "Delivered" | "Revision" | "Cancelled";
// ============================================================================
// CONFIGURATION
// ============================================================================

export const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; color: string }
> = {
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

export const ACTION_CONFIG: Record<AuditAction, ActionConfig> = {
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
