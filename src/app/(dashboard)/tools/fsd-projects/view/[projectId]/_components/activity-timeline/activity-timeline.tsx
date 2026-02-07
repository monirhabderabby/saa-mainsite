"use client";

import { AuditLogWithActor } from "@/app/api/auditLog/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowRightLeft,
  Briefcase,
  Calendar,
  DollarSign,
  Loader2,
  Star,
  User,
  Users,
} from "lucide-react";
import moment from "moment";
import { ACTION_CONFIG, STATUS_CONFIG, StatusKey } from "./lib/constants";
import {
  formatFieldName,
  getInitials,
  parseChanges,
  ParsedChange,
} from "./lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Props {
  projectId: string;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function UserAvatar({ actor }: { actor: AuditLogWithActor["actor"] }) {
  return (
    <Avatar className="h-6 w-6 shrink-0 ring-2 ring-background">
      {actor?.image && (
        <AvatarImage src={actor.image} alt={actor.fullName ?? "User"} />
      )}
      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
        {actor?.fullName ? getInitials(actor.fullName) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function TimelineRail({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="relative flex flex-col items-center shrink-0 w-8">
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center",
          color,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 w-px bg-border mt-2" />
    </div>
  );
}

function ActivityHeader({
  actorName,
  actionLabel,
  entityTitle,
  timestamp,
}: {
  actorName: string;
  actionLabel: string;
  entityTitle: string;
  timestamp: Date;
}) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
        <span className="font-semibold text-foreground">{actorName}</span>
        <span className="text-muted-foreground">{actionLabel}</span>
        <span className="font-medium text-primary truncate max-w-[200px]">
          {entityTitle}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground">
        {moment(timestamp).fromNow()}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as StatusKey];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] px-1.5 py-0 font-normal h-5", config.color)}
    >
      {config.label}
    </Badge>
  );
}

function ChangeRow({
  label,
  icon: Icon,
  from,
  to,
  colorFrom,
  colorTo,
}: {
  label: string;
  icon?: React.ElementType;
  from: React.ReactNode;
  to: React.ReactNode;
  colorFrom: string;
  colorTo: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground min-w-[60px] text-[10px]">
        {label}:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <div
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px]",
            colorFrom,
          )}
        >
          {Icon && <Icon className="h-3 w-3" />}
          <span>{from}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px]",
            colorTo,
          )}
        >
          {Icon && <Icon className="h-3 w-3" />}
          <span>{to}</span>
        </div>
      </div>
    </div>
  );
}

function StatusChange({ from, to }: { from: string; to: string }) {
  const fromConfig = STATUS_CONFIG[from as StatusKey];
  const toConfig = STATUS_CONFIG[to as StatusKey];

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        Status: <span className="font-medium">{fromConfig?.label || from}</span>{" "}
        → <span className="font-medium">{toConfig?.label || to}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <StatusBadge status={from} />
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <StatusBadge status={to} />
      </div>
    </div>
  );
}

function TeamChange({ from, to }: { from: string; to: string }) {
  return (
    <ChangeRow
      label="Team"
      icon={Users}
      from={from}
      to={to}
      colorFrom="bg-slate-50 border-slate-200 text-slate-700"
      colorTo="bg-blue-50 border-blue-200 text-blue-700"
    />
  );
}

function ClientChange({ from, to }: { from: string; to: string }) {
  return (
    <ChangeRow
      label="Client"
      icon={Users}
      from={from}
      to={to}
      colorFrom="bg-purple-50 border-purple-200 text-purple-700"
      colorTo="bg-purple-100 border-purple-300 text-purple-800"
    />
  );
}

function SalesPersonChange({ from, to }: { from: string; to: string }) {
  return (
    <ChangeRow
      label="Sales"
      icon={User}
      from={from}
      to={to}
      colorFrom="bg-teal-50 border-teal-200 text-teal-700"
      colorTo="bg-teal-100 border-teal-300 text-teal-800"
    />
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
    deadline: "Deadline",
    orderDate: "Order",
    delivered: "Delivered",
    probablyWillBeDeliver: "Expected",
    supportPeriodStart: "Support Start",
    supportPeriodEnd: "Support End",
    lastUpdate: "Last Update",
    nextUpdate: "Next Update",
  };

  return (
    <ChangeRow
      label={fieldLabels[field] || field}
      icon={Calendar}
      from={moment(from).format("MMM DD, YYYY")}
      to={moment(to).format("MMM DD, YYYY")}
      colorFrom="bg-orange-50 border-orange-200 text-orange-700"
      colorTo="bg-orange-100 border-orange-300 text-orange-800"
    />
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
  const label = field === "value" ? "Value" : "Amount";

  return (
    <ChangeRow
      label={label}
      icon={DollarSign}
      from={`$${from.toLocaleString()}`}
      to={`$${to.toLocaleString()}`}
      colorFrom="bg-green-50 border-green-200 text-green-700"
      colorTo="bg-green-100 border-green-300 text-green-800"
    />
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
    title: "Title",
    shortDescription: "Description",
    instructionSheet: "Instructions",
    shift: "Shift",
    remarkFromOperation: "Operations",
    quickNoteFromLeader: "Leader Note",
    progressSheet: "Progress",
    credentialSheet: "Credentials",
    websiteIssueTrackerSheet: "Issues",
  };

  const label = fieldLabels[field] || formatFieldName(field);

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <div className="text-[10px] space-y-0.5">
        <div className="text-muted-foreground line-through">{from}</div>
        <div className="text-foreground font-medium">{to}</div>
      </div>
    </div>
  );
}

function ReviewChange({ from, to }: { from: number; to: number }) {
  return (
    <ChangeRow
      label="Review"
      icon={Star}
      from={`${from} ★`}
      to={`${to} ★`}
      colorFrom="bg-yellow-50 border-yellow-200 text-yellow-700"
      colorTo="bg-yellow-100 border-yellow-300 text-yellow-800"
    />
  );
}

function ProfileChange({ from, to }: { from: string; to: string }) {
  return (
    <ChangeRow
      label="Profile"
      icon={Briefcase}
      from={from}
      to={to}
      colorFrom="bg-indigo-50 border-indigo-200 text-indigo-700"
      colorTo="bg-indigo-100 border-indigo-300 text-indigo-800"
    />
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
    UIUX: "UI/UX",
    FRONTEND: "Frontend",
    BACKEND: "Backend",
    QA: "QA",
    PM: "PM",
  };

  const roleLabel = roleLabels[role] || role;
  const added = to.filter((userName) => !from.includes(userName));
  const removed = from.filter((userName) => !to.includes(userName));
  const unchanged = from.filter((userName) => to.includes(userName));

  let actionText = "";
  if (added.length > 0 && removed.length === 0 && unchanged.length === 0) {
    actionText = `Assigned ${roleLabel}`;
  } else if (removed.length > 0 && added.length === 0) {
    actionText = `Unassigned ${roleLabel}`;
  } else {
    actionText = `Updated ${roleLabel}`;
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground font-medium">
        {actionText}
      </p>
      <div className="flex flex-wrap gap-1">
        {removed.map((userName, idx) => (
          <div
            key={`removed-${userName}-${idx}`}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px] bg-red-50 border-red-200 text-red-700 line-through opacity-60"
          >
            <User className="h-2.5 w-2.5" />
            <span>{userName}</span>
          </div>
        ))}
        {removed.length > 0 && (added.length > 0 || unchanged.length > 0) && (
          <ArrowRight className="h-3 w-3 text-muted-foreground self-center" />
        )}
        {unchanged.map((userName, idx) => (
          <div
            key={`unchanged-${userName}-${idx}`}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px] bg-cyan-50 border-cyan-200 text-cyan-700"
          >
            <User className="h-2.5 w-2.5" />
            <span>{userName}</span>
          </div>
        ))}
        {added.length > 0 && unchanged.length > 0 && (
          <ArrowRightLeft className="h-3 w-3 text-muted-foreground self-center" />
        )}
        {added.map((userName, idx) => (
          <div
            key={`added-${userName}-${idx}`}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-300"
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
    <div className="flex items-start gap-2 text-xs">
      <div className="min-w-[60px] text-[10px] font-medium text-muted-foreground">
        {formatFieldName(field)}:
      </div>
      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
        <span className="text-[10px] text-muted-foreground line-through">
          {String(from)}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-foreground font-medium">
          {String(to)}
        </span>
      </div>
    </div>
  );
}

function renderSingleChange(change: ParsedChange) {
  const { field, from, to } = change;

  if (field === "status") {
    return <StatusChange from={from as string} to={to as string} />;
  }
  if (field === "team") {
    return <TeamChange from={from as string} to={to as string} />;
  }
  if (field === "clientName") {
    return <ClientChange from={from as string} to={to as string} />;
  }
  if (field === "salesPerson" || field === "salesPersonId") {
    return <SalesPersonChange from={from as string} to={to as string} />;
  }
  if (field === "profile" || field === "profileId") {
    return <ProfileChange from={from as string} to={to as string} />;
  }

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

  if (field === "value" || field === "monetaryValue") {
    return (
      <MonetaryChange field={field} from={from as number} to={to as number} />
    );
  }

  if (field === "review") {
    return <ReviewChange from={from as number} to={to as number} />;
  }

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

  return <GenericChange field={field} from={from} to={to} />;
}

function renderAssignmentChanges(
  assignments: Record<string, [string[], string[]]>,
) {
  const roles = Object.keys(assignments);

  if (roles.length === 1) {
    const role = roles[0];
    const [from, to] = assignments[role];
    return <AssignmentChange role={role} from={from} to={to} />;
  }

  return (
    <div className="space-y-2 p-2 bg-muted/30 rounded border border-border/50">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {roles.length} Assignments
      </div>
      {roles.map((role) => {
        const [from, to] = assignments[role];
        return <AssignmentChange key={role} role={role} from={from} to={to} />;
      })}
    </div>
  );
}

function MultipleChanges({ changes }: { changes: ParsedChange[] }) {
  return (
    <div className="space-y-2 p-2 bg-muted/30 rounded border border-border/50">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {changes.length} Changes
      </div>
      <div className="space-y-1.5">
        {changes.map((change, index) => (
          <div key={index}>{renderSingleChange(change)}</div>
        ))}
      </div>
    </div>
  );
}

function ProjectCreationMeta({
  status,
  profile,
  orderId,
}: {
  status: string | null;
  profile: string | null;
  orderId: string | null;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status && <StatusBadge status={status} />}
      {profile && (
        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
          {profile}
        </span>
      )}
      {orderId && (
        <span className="text-[10px] text-muted-foreground font-mono">
          #{orderId}
        </span>
      )}
    </div>
  );
}

function CommentDetail({ comment }: { comment: string }) {
  return (
    <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 rounded-r">
      <p className="text-xs text-muted-foreground italic leading-relaxed">
        &ldquo;{comment}&rdquo;
      </p>
    </div>
  );
}

// ============================================================================
// MAIN TIMELINE ITEM
// ============================================================================

function TimelineItem({
  log,
  isLast,
}: {
  log: AuditLogWithActor;
  isLast: boolean;
}) {
  const config = ACTION_CONFIG[log.action];
  const Icon = config.icon;

  const meta = (log.meta as Record<string, string> | null) ?? {};
  const entityTitle = meta.entityTitle ?? "Untitled";
  const comment = meta.comment ?? null;
  const status = meta.status ?? null;
  const orderId = meta.orderId ?? null;
  const profile = meta.profile ?? null;

  const logChanges = (log.changes as Record<string, unknown> | null) ?? {};
  const assignmentChanges = logChanges.assignments as
    | Record<string, [string[], string[]]>
    | undefined;

  const regularChangesObj = { ...logChanges };
  delete regularChangesObj.assignments;

  const changes = parseChanges(regularChangesObj);
  const hasMultipleChanges = changes.length > 1;
  const singleChange = changes.length === 1 ? changes[0] : null;

  return (
    <div className="flex gap-3 group">
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
            config.dotColor,
          )}
        >
          <Icon className="h-2.5 w-2.5" />
        </div>
        {!isLast && <div className="flex-1 w-px bg-border mt-2 min-h-[20px]" />}
      </div>

      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start gap-2 mb-2">
          <UserAvatar actor={log.actor} />
          <div className="flex-1 min-w-0">
            <ActivityHeader
              actorName={log.actor?.fullName ?? "Unknown User"}
              actionLabel={config.label}
              entityTitle={entityTitle}
              timestamp={log.createdAt}
            />
          </div>
        </div>

        <div className="ml-10 space-y-2">
          {log.action === "CREATE" && (
            <ProjectCreationMeta
              status={status}
              profile={profile}
              orderId={orderId}
            />
          )}

          {log.action === "UPDATE" &&
            assignmentChanges &&
            renderAssignmentChanges(assignmentChanges)}

          {log.action === "UPDATE" && hasMultipleChanges && (
            <MultipleChanges changes={changes} />
          )}

          {log.action === "UPDATE" &&
            singleChange &&
            !hasMultipleChanges &&
            renderSingleChange(singleChange)}

          {log.action === "COMMENT_ADDED" && comment && (
            <CommentDetail comment={comment} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PAGE_SIZE = 5;

type AuditLogApiResponse = {
  data: AuditLogWithActor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

const ActivityTimeline = ({ projectId }: Props) => {
  const {
    data: response,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<AuditLogApiResponse>({
    queryKey: ["auditLog", "project", projectId],
    queryFn: ({ pageParam = 1 }) =>
      fetch(
        `/api/auditLog?entity=project&entityId=${projectId}&page=${pageParam}&limit=${PAGE_SIZE}`,
      ).then((res) => res.json()),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <EmptyState message="Failed to load activity. Please try again." />;
  }

  const logs = response?.pages?.flatMap((p) => p.data) ?? [];

  if (logs.length === 0) {
    return <EmptyState message="No activity found for this project." />;
  }

  return (
    <div className="relative" role="feed" aria-label="Activity timeline">
      {logs.map((log, index) => (
        <TimelineItem
          key={log.id}
          log={log}
          isLast={index === logs.length - 1}
        />
      ))}

      {hasNextPage && (
        <div className="flex items-center justify-center py-4">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFetchingNextPage || !hasNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{!hasNextPage ? "End" : "Load More"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
