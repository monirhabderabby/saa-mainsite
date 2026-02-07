"use client";

import { AuditLogWithActor } from "@/app/api/auditLog/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AuditAction } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowRightLeft,
  Briefcase,
  Calendar,
  DollarSign,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react";
import moment from "moment";
import React from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Props {
  projectId: string;
}

interface ActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

interface ParsedChange {
  field: string;
  from: unknown;
  to: unknown;
}

type StatusKey = "NRA" | "WIP" | "Delivered" | "Revision" | "Cancelled";

// ============================================================================
// CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string }> = {
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function parseChanges(changes: Record<string, unknown> | null): ParsedChange[] {
  if (!changes) return [];

  return Object.entries(changes)
    .map(([field, value]) => {
      // Handle array format: ["oldValue", "newValue"]
      if (Array.isArray(value) && value.length >= 2) {
        return { field, from: value[0], to: value[1] };
      }

      // Handle object format: { from: "oldValue", to: "newValue" }
      if (value && typeof value === "object") {
        const v = value as Record<string, unknown>;
        if ("from" in v || "to" in v) {
          return { field, from: v.from, to: v.to };
        }
      }

      return null;
    })
    .filter((change): change is ParsedChange => change !== null);
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function UserAvatar({ actor }: { actor: AuditLogWithActor["actor"] }) {
  return (
    <Avatar className="h-10 w-10 shrink-0 mt-0.5">
      {actor?.image && (
        <AvatarImage src={actor.image} alt={actor.fullName ?? "User"} />
      )}
      <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
        {actor?.fullName ? getInitials(actor.fullName) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function ActivityHeader({
  actorName,
  actionLabel,
  entityTitle,
  dotColor,
  timestamp,
}: {
  actorName: string;
  actionLabel: string;
  entityTitle: string;
  dotColor: string;
  timestamp: Date;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      <span className="font-semibold text-foreground">{actorName}</span>
      <span className="text-muted-foreground">{actionLabel}</span>
      <span className="font-medium text-blue-600 dark:text-blue-400">
        {entityTitle}
      </span>
      <span
        className={cn("inline-block h-2 w-2 rounded-full shrink-0", dotColor)}
        aria-hidden="true"
      />
      <span className="text-muted-foreground text-xs">
        {moment(timestamp).fromNow()}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as StatusKey];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={cn("text-[8px] px-1 py-0.5 font-normal", config.color)}
    >
      {config.label}
    </Badge>
  );
}

function StatusChange({ from, to }: { from: string; to: string }) {
  const fromConfig = STATUS_CONFIG[from as StatusKey];
  const toConfig = STATUS_CONFIG[to as StatusKey];

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Changed status from{" "}
        <span className="font-medium text-foreground">
          {fromConfig?.label || from}
        </span>{" "}
        to{" "}
        <span className="font-medium text-foreground">
          {toConfig?.label || to}
        </span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={from} />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <StatusBadge status={to} />
      </div>
    </div>
  );
}

function TeamChange({ from, to }: { from: string; to: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Moved from <span className="font-medium text-foreground">{from}</span>{" "}
        team to <span className="font-medium text-foreground">{to}</span> team
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 border border-slate-200">
          <Users className="h-2.5 w-2.5 text-slate-500" />
          <span className="text-[8px] font-medium text-slate-700">{from}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 border border-blue-200">
          <Users className="h-2.5 w-2.5 text-blue-600" />
          <span className="text-[8px] font-medium text-blue-700">{to}</span>
        </div>
      </div>
    </div>
  );
}

function ClientChange({ from, to }: { from: string; to: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Updated client name from{" "}
        <span className="font-medium text-foreground">{from}</span> to{" "}
        <span className="font-medium text-foreground">{to}</span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 border border-purple-200">
          <Users className="h-2.5 w-2.5 text-purple-500" />
          <span className="text-[8px] font-medium text-purple-700">{from}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-purple-100 px-2 py-1 border border-purple-300">
          <Users className="h-2.5 w-2.5 text-purple-700" />
          <span className="text-[8px] font-medium text-purple-800">{to}</span>
        </div>
      </div>
    </div>
  );
}

function SalesPersonChange({ from, to }: { from: string; to: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Reassigned sales person from{" "}
        <span className="font-medium text-foreground">{from}</span> to{" "}
        <span className="font-medium text-foreground">{to}</span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-teal-50 px-2 py-1 border border-teal-200">
          <User className="h-2.5 w-2.5 text-teal-500" />
          <span className="text-[8px] font-medium text-teal-700">{from}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-teal-100 px-2 py-1 border border-teal-300">
          <User className="h-2.5 w-2.5 text-teal-700" />
          <span className="text-[8px] font-medium text-teal-800">{to}</span>
        </div>
      </div>
    </div>
  );
}

function DateChange({
  field,
  from,
  to,
}: {
  field: string;
  from: string;
  to: string;
}) {
  const fieldLabels: Record<string, string> = {
    deadline: "deadline",
    orderDate: "order date",
    delivered: "delivery date",
    probablyWillBeDeliver: "expected delivery",
    supportPeriodStart: "support start date",
    supportPeriodEnd: "support end date",
    lastUpdate: "last update",
    nextUpdate: "next update",
  };

  const label = fieldLabels[field] || field;
  const fromDate = moment(from).format("MMM DD, YYYY");
  const toDate = moment(to).format("MMM DD, YYYY");

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Changed {label} from{" "}
        <span className="font-medium text-foreground">{fromDate}</span> to{" "}
        <span className="font-medium text-foreground">{toDate}</span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 border border-orange-200">
          <Calendar className="h-2.5 w-2.5 text-orange-500" />
          <span className="text-[8px] font-medium text-orange-700">
            {fromDate}
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-orange-100 px-2 py-1 border border-orange-300">
          <Calendar className="h-2.5 w-2.5 text-orange-700" />
          <span className="text-[8px] font-medium text-orange-800">
            {toDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function MonetaryChange({
  field,
  from,
  to,
}: {
  field: string;
  from: number;
  to: number;
}) {
  const fieldLabels: Record<string, string> = {
    value: "project value",
    monetaryValue: "monetary value",
  };

  const label = fieldLabels[field] || field;

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Updated {label} from{" "}
        <span className="font-medium text-foreground">
          ${from.toLocaleString()}
        </span>{" "}
        to{" "}
        <span className="font-medium text-foreground">
          ${to.toLocaleString()}
        </span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 border border-green-200">
          <DollarSign className="h-2.5 w-2.5 text-green-500" />
          <span className="text-[8px] font-medium text-green-700">
            ${from.toLocaleString()}
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-green-100 px-2 py-1 border border-green-300">
          <DollarSign className="h-2.5 w-2.5 text-green-700" />
          <span className="text-[8px] font-medium text-green-800">
            ${to.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function TextChange({
  field,
  from,
  to,
}: {
  field: string;
  from: string;
  to: string;
}) {
  const fieldLabels: Record<string, string> = {
    title: "title",
    shortDescription: "description",
    instructionSheet: "instruction sheet",
    shift: "shift",
    remarkFromOperation: "operation remark",
    quickNoteFromLeader: "leader note",
    progressSheet: "progress sheet",
    credentialSheet: "credential sheet",
    websiteIssueTrackerSheet: "issue tracker sheet",
  };

  const label = fieldLabels[field] || formatFieldName(field);

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">Updated {label}</p>
      <div className="flex items-start gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-muted-foreground line-through mb-1">
            {from}
          </div>
          <div className="text-[11px] text-foreground font-medium">{to}</div>
        </div>
      </div>
    </div>
  );
}

function ReviewChange({ from, to }: { from: number; to: number }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Changed review rating from{" "}
        <span className="font-medium text-foreground">{from} stars</span> to{" "}
        <span className="font-medium text-foreground">{to} stars</span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 border border-yellow-200">
          <Star className="h-2.5 w-2.5 text-yellow-500" />
          <span className="text-[8px] font-medium text-yellow-700">
            {from} ★
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-yellow-100 px-2 py-1 border border-yellow-300">
          <Star className="h-2.5 w-2.5 text-yellow-700" />
          <span className="text-[8px] font-medium text-yellow-800">{to} ★</span>
        </div>
      </div>
    </div>
  );
}

function ProfileChange({ from, to }: { from: string; to: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">
        Changed profile from{" "}
        <span className="font-medium text-foreground">{from}</span> to{" "}
        <span className="font-medium text-foreground">{to}</span>
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 border border-indigo-200">
          <Briefcase className="h-2.5 w-2.5 text-indigo-500" />
          <span className="text-[8px] font-medium text-indigo-700">{from}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-1.5 rounded-md bg-indigo-100 px-2 py-1 border border-indigo-300">
          <Briefcase className="h-2.5 w-2.5 text-indigo-700" />
          <span className="text-[8px] font-medium text-indigo-800">{to}</span>
        </div>
      </div>
    </div>
  );
}

function AssignmentChange({
  role,
  from,
  to,
}: {
  role: string;
  from: string[];
  to: string[];
}) {
  const roleLabels: Record<string, string> = {
    UIUX: "UI/UX Designer",
    FRONTEND: "Frontend Developer",
    BACKEND: "Backend Developer",
    QA: "QA Engineer",
    PM: "Project Manager",
  };

  const roleLabel = roleLabels[role] || role;

  // Determine what changed
  const added = to.filter((userName) => !from.includes(userName));
  const removed = from.filter((userName) => !to.includes(userName));
  const unchanged = from.filter((userName) => to.includes(userName));

  let actionText = "";
  if (added.length > 0 && removed.length === 0 && unchanged.length === 0) {
    // Pure addition (no one was there before)
    actionText = `Assigned ${roleLabel}${added.length > 1 ? "s" : ""}`;
  } else if (removed.length > 0 && added.length === 0) {
    // Pure removal (no one added)
    actionText = `Unassigned ${roleLabel}${removed.length > 1 ? "s" : ""}`;
  } else {
    // Mixed: some added, some removed, or some unchanged
    actionText = `Updated ${roleLabel} assignments`;
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm text-muted-foreground">{actionText}</p>
      <div className="flex flex-wrap gap-1">
        {/* Show removed users with strikethrough */}
        {removed.map((userName, idx) => (
          <div
            key={`removed-${userName}-${idx}`}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 border text-[8px] font-medium bg-red-50 border-red-200 text-red-700 line-through opacity-60"
          >
            <User className="h-2.5 w-2.5" />
            <span>{userName}</span>
          </div>
        ))}

        {/* Show arrow if there are changes */}
        {removed.length > 0 && (added.length > 0 || unchanged.length > 0) && (
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground self-center" />
        )}

        {/* Show unchanged users (neutral) */}
        {unchanged.map((userName, idx) => (
          <div
            key={`unchanged-${userName}-${idx}`}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 border text-[8px] font-medium bg-cyan-50 border-cyan-200 text-cyan-700"
          >
            <User className="h-2.5 w-2.5" />
            <span>{userName}</span>
          </div>
        ))}
        {added.length > 0 && unchanged.length > 0 && (
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground self-center" />
        )}

        {/* Show added users with green highlight */}
        {added.map((userName, idx) => (
          <div
            key={`added-${userName}-${idx}`}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 border text-[8px] font-medium bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-200"
          >
            <User className="h-2.5 w-2.5" />
            <span>{userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericChange({ field, from, to }: ParsedChange) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
        {formatFieldName(field)}:
      </div>
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        <span className="text-[11px] text-muted-foreground line-through">
          {String(from)}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] text-foreground font-medium">
          {String(to)}
        </span>
      </div>
    </div>
  );
}

function renderSingleChange(change: ParsedChange) {
  const { field, from, to } = change;

  // Status changes
  if (field === "status") {
    return <StatusChange from={from as string} to={to as string} />;
  }

  // Team changes
  if (field === "team") {
    return <TeamChange from={from as string} to={to as string} />;
  }

  // Client changes
  if (field === "clientName") {
    return <ClientChange from={from as string} to={to as string} />;
  }

  // Sales person changes
  if (field === "salesPerson" || field === "salesPersonId") {
    return <SalesPersonChange from={from as string} to={to as string} />;
  }

  // Profile changes
  if (field === "profile" || field === "profileId") {
    return <ProfileChange from={from as string} to={to as string} />;
  }

  // Date changes
  const dateFields = [
    "deadline",
    "orderDate",
    "delivered",
    "probablyWillBeDeliver",
    "supportPeriodStart",
    "supportPeriodEnd",
    "lastUpdate",
    "nextUpdate",
  ];
  if (dateFields.includes(field)) {
    return <DateChange field={field} from={from as string} to={to as string} />;
  }

  // Monetary changes
  if (field === "value" || field === "monetaryValue") {
    return (
      <MonetaryChange field={field} from={from as number} to={to as number} />
    );
  }

  // Review changes
  if (field === "review") {
    return <ReviewChange from={from as number} to={to as number} />;
  }

  // Text changes
  const textFields = [
    "title",
    "shortDescription",
    "instructionSheet",
    "shift",
    "remarkFromOperation",
    "quickNoteFromLeader",
    "progressSheet",
    "credentialSheet",
    "websiteIssueTrackerSheet",
  ];
  if (textFields.includes(field)) {
    return <TextChange field={field} from={from as string} to={to as string} />;
  }

  // Generic fallback
  return <GenericChange field={field} from={from} to={to} />;
}

function renderAssignmentChanges(
  assignments: Record<string, [string[], string[]]>,
) {
  const roles = Object.keys(assignments);

  if (roles.length === 1) {
    // Single role assignment change
    const role = roles[0];
    const [from, to] = assignments[role];
    return <AssignmentChange role={role} from={from} to={to} />;
  }

  // Multiple role assignment changes
  return (
    <div className="mt-2 space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {roles.length} Assignment Changes
      </div>
      {roles.map((role) => {
        const [from, to] = assignments[role];
        return (
          <div key={role}>
            <AssignmentChange role={role} from={from} to={to} />
          </div>
        );
      })}
    </div>
  );
}

function MultipleChanges({ changes }: { changes: ParsedChange[] }) {
  return (
    <div className="mt-2 space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {changes.length} Changes
      </div>
      {changes.map((change, index) => {
        const { field, from, to } = change;

        return (
          <div key={index}>
            {field === "status" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Status:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={from as string} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <StatusBadge status={to as string} />
                </div>
              </div>
            ) : field === "team" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Team:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 border border-slate-200">
                    <Users className="h-2.5 w-2.5 text-slate-500" />
                    <span className="text-[8px] font-medium text-slate-700">
                      {from as string}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 border border-blue-200">
                    <Users className="h-2.5 w-2.5 text-blue-600" />
                    <span className="text-[8px] font-medium text-blue-700">
                      {to as string}
                    </span>
                  </div>
                </div>
              </div>
            ) : field === "clientName" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Client:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 border border-purple-200">
                    <Users className="h-2.5 w-2.5 text-purple-500" />
                    <span className="text-[8px] font-medium text-purple-700">
                      {from as string}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-purple-100 px-2 py-1 border border-purple-300">
                    <Users className="h-2.5 w-2.5 text-purple-700" />
                    <span className="text-[8px] font-medium text-purple-800">
                      {to as string}
                    </span>
                  </div>
                </div>
              </div>
            ) : field === "salesPerson" || field === "salesPersonId" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Sales Person:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-teal-50 px-2 py-1 border border-teal-200">
                    <User className="h-2.5 w-2.5 text-teal-500" />
                    <span className="text-[8px] font-medium text-teal-700">
                      {from as string}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-teal-100 px-2 py-1 border border-teal-300">
                    <User className="h-2.5 w-2.5 text-teal-700" />
                    <span className="text-[8px] font-medium text-teal-800">
                      {to as string}
                    </span>
                  </div>
                </div>
              </div>
            ) : field === "profile" || field === "profileId" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Profile:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 border border-indigo-200">
                    <Briefcase className="h-2.5 w-2.5 text-indigo-500" />
                    <span className="text-[8px] font-medium text-indigo-700">
                      {from as string}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-indigo-100 px-2 py-1 border border-indigo-300">
                    <Briefcase className="h-2.5 w-2.5 text-indigo-700" />
                    <span className="text-[8px] font-medium text-indigo-800">
                      {to as string}
                    </span>
                  </div>
                </div>
              </div>
            ) : [
                "deadline",
                "orderDate",
                "delivered",
                "probablyWillBeDeliver",
                "supportPeriodStart",
                "supportPeriodEnd",
                "lastUpdate",
                "nextUpdate",
              ].includes(field) ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  {formatFieldName(field)}:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 border border-orange-200">
                    <Calendar className="h-2.5 w-2.5 text-orange-500" />
                    <span className="text-[8px] font-medium text-orange-700">
                      {moment(from as string).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-orange-100 px-2 py-1 border border-orange-300">
                    <Calendar className="h-2.5 w-2.5 text-orange-700" />
                    <span className="text-[8px] font-medium text-orange-800">
                      {moment(to as string).format("MMM DD, YYYY")}
                    </span>
                  </div>
                </div>
              </div>
            ) : field === "value" || field === "monetaryValue" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  {formatFieldName(field)}:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 border border-green-200">
                    <DollarSign className="h-2.5 w-2.5 text-green-500" />
                    <span className="text-[8px] font-medium text-green-700">
                      ${(from as number).toLocaleString()}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-green-100 px-2 py-1 border border-green-300">
                    <DollarSign className="h-2.5 w-2.5 text-green-700" />
                    <span className="text-[8px] font-medium text-green-800">
                      ${(to as number).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : field === "review" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-[80px] text-[11px] font-medium text-muted-foreground">
                  Review:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 border border-yellow-200">
                    <Star className="h-2.5 w-2.5 text-yellow-500" />
                    <span className="text-[8px] font-medium text-yellow-700">
                      {from as number} ★
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 rounded-md bg-yellow-100 px-2 py-1 border border-yellow-300">
                    <Star className="h-2.5 w-2.5 text-yellow-700" />
                    <span className="text-[8px] font-medium text-yellow-800">
                      {to as number} ★
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <GenericChange {...change} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectCreationDetails({
  status,
  profile,
  orderId,
}: {
  status: string | null;
  profile: string | null;
  orderId: string | null;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      {status && <StatusBadge status={status} />}
      {profile && (
        <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
          {profile}
        </span>
      )}
      {orderId && (
        <span className="text-[11px] text-muted-foreground font-mono">
          #{orderId}
        </span>
      )}
    </div>
  );
}

function CommentDetail({ comment }: { comment: string }) {
  return (
    <div className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 rounded-r">
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        &#34;{comment}&#34;
      </p>
    </div>
  );
}

function DescriptionDetail({ description }: { description: string }) {
  return (
    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
      {description}
    </p>
  );
}

// ============================================================================
// MAIN ACTIVITY ITEM
// ============================================================================

function ActivityItem({ log }: { log: AuditLogWithActor }) {
  const config = ACTION_CONFIG[log.action];
  const Icon = config.icon;

  const meta = (log.meta as Record<string, string> | null) ?? {};
  const entityTitle = meta.entityTitle ?? "Untitled";
  const comment = meta.comment ?? null;
  const description = meta.description ?? null;
  const status = meta.status ?? null;
  const orderId = meta.orderId ?? null;
  const profile = meta.profile ?? null;

  const logChanges = (log.changes as Record<string, unknown> | null) ?? {};

  // Extract assignment changes separately
  const assignmentChanges = logChanges.assignments as
    | Record<string, [string[], string[]]>
    | undefined;

  // Parse regular changes (excluding assignments)
  const regularChangesObj = { ...logChanges };
  delete regularChangesObj.assignments;

  const changes = parseChanges(regularChangesObj);
  const hasMultipleChanges = changes.length > 1;
  const singleChange = changes.length === 1 ? changes[0] : null;

  return (
    <div className="flex gap-4 py-5 group hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors">
      <UserAvatar actor={log.actor} />

      <div className="flex-1 min-w-0">
        <ActivityHeader
          actorName={log.actor?.fullName ?? "Unknown User"}
          actionLabel={config.label}
          entityTitle={entityTitle}
          dotColor={config.dotColor}
          timestamp={log.createdAt}
        />

        {/* Project creation details */}
        {log.action === "CREATE" && (
          <ProjectCreationDetails
            status={status}
            profile={profile}
            orderId={orderId}
          />
        )}

        {/* Assignment changes */}
        {log.action === "UPDATE" &&
          assignmentChanges &&
          renderAssignmentChanges(assignmentChanges)}

        {/* Multiple regular changes */}
        {log.action === "UPDATE" && hasMultipleChanges && (
          <MultipleChanges changes={changes} />
        )}

        {/* Single change - use helper function */}
        {log.action === "UPDATE" &&
          singleChange &&
          !hasMultipleChanges &&
          renderSingleChange(singleChange)}

        {/* Comment */}
        {log.action === "COMMENT_ADDED" && comment && (
          <CommentDetail comment={comment} />
        )}

        {/* Generic description */}
        {log.action !== "COMMENT_ADDED" &&
          log.action !== "STATUS_CHANGE" &&
          description && <DescriptionDetail description={description} />}
      </div>

      <div className="shrink-0 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 py-5 -mx-4 px-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActivityTimeline = ({ projectId }: Props) => {
  const { data, isLoading, isError } = useQuery<AuditLogWithActor[]>({
    queryKey: ["auditLog", "project", projectId],
    queryFn: () =>
      fetch(`/api/auditLog?entity=project&entityId=${projectId}`).then((res) =>
        res.json(),
      ),
  });

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState message="Failed to load activity. Please try again." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No activity found for this project." />;
  }

  return (
    <div className="divide-y divide-border">
      {data.map((log) => (
        <ActivityItem key={log.id} log={log} />
      ))}
    </div>
  );
};

export default ActivityTimeline;
