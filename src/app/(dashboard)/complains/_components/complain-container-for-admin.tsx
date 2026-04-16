"use client";

const ComplaintViewModal = dynamic(
  () => import("@/components/shared/modal/complains/ComplaintViewModal"),
  {
    ssr: false,
  },
);
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { useGetAdminComplains } from "@/hook/complains/use-get-admin-complains";
import { ComplaintPriority, ComplaintStatus } from "@prisma/client";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  SlidersHorizontal,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import DeleteButton from "./delete-button";

// ── Status config ──────────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  OPEN: {
    label: "Open",
    icon: <Clock className="h-2.5 w-2.5" />,
    cls: "bg-customYellow-primary/10 text-customYellow-primary border-customYellow-primary/25",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Zap className="h-2.5 w-2.5" />,
    cls: "bg-blue-500/10 text-blue-500 border-blue-500/25",
  },
  RESOLVED: {
    label: "Resolved",
    icon: <CheckCircle2 className="h-2.5 w-2.5" />,
    cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle className="h-2.5 w-2.5" />,
    cls: "bg-red-500/10 text-red-500 border-red-500/25",
  },
};

export const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { cls: string; dot: string }
> = {
  HIGH: { cls: "text-red-500", dot: "bg-red-500" },
  MEDIUM: { cls: "text-amber-500", dot: "bg-amber-500" },
  LOW: { cls: "text-emerald-500", dot: "bg-emerald-500" },
};

interface Props {
  isAdmin: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────
const ComplainsContainerForAdmin = ({ isAdmin }: Props) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<ComplaintStatus[]>([
    "IN_PROGRESS",
    "OPEN",
  ]);
  const [priorities, setPriorities] = useState<ComplaintPriority[]>([]);

  const { data, isLoading, isError } = useGetAdminComplains({
    page,
    limit: 9,
    statuses,
    priorities,
  });

  const complaints = data?.data ?? [];
  const pagination = data?.pagination;

  // client-side search filter (on current page data)
  const filtered = search.trim()
    ? complaints.filter(
        (c) =>
          c.subject.toLowerCase().includes(search.toLowerCase()) ||
          c.message.toLowerCase().includes(search.toLowerCase()) ||
          c.uniqueId.toLowerCase().includes(search.toLowerCase()),
      )
    : complaints;

  const resetFilters = () => {
    setStatuses([]);
    setPriorities([]);
    setSearch("");
    setPage(1);
  };

  const hasFilters = statuses.length > 0 || priorities.length > 0 || search;

  return (
    <Card className="space-y-5 p-5  pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Complaints</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pagination ? (
              <span>
                {pagination.total} total submission
                {pagination.total !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>Track your formal submissions</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Input
            startIcon={Search}
            placeholder="Search by subject or complain ID or message…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Status */}
        <MultiSelectDropdown
          placeholder="Status"
          options={Object.values(ComplaintStatus).map((s) => ({
            value: s,
            label: STATUS_CONFIG[s].label,
            icon: STATUS_CONFIG[s].icon,
          }))}
          selected={statuses}
          onChange={(vals) => {
            setStatuses(vals as ComplaintStatus[]);
            setPage(1);
          }}
        />

        {/* Priority */}
        <MultiSelectDropdown
          placeholder="Priority"
          options={Object.values(ComplaintPriority).map((p) => ({
            value: p,
            label: p.charAt(0) + p.slice(1).toLowerCase(),
          }))}
          selected={priorities}
          onChange={(vals) => {
            setPriorities(vals as ComplaintPriority[]);
            setPage(1);
          }}
        />

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Active filter pills ── */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 -mt-1">
          {statuses.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground"
            >
              {STATUS_CONFIG[s].label}
              <button
                onClick={() => {
                  setStatuses((prev) => prev.filter((x) => x !== s));
                  setPage(1);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {priorities.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground"
            >
              {p.charAt(0) + p.slice(1).toLowerCase()}
              <button
                onClick={() => {
                  setPriorities((prev) => prev.filter((x) => x !== p));
                  setPage(1);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {search && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground">
              &quot;{search}&quot;
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── Error ── */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <XCircle className="h-8 w-8 text-red-400 mb-3" />
          <p className="text-sm font-medium">Failed to load complaints</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try refreshing the page.
          </p>
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/10">
          <div className="h-10 w-10 rounded-full bg-primary/8 flex items-center justify-center mb-3">
            <MessageSquare className="h-5 w-5 text-primary/60" />
          </div>
          <p className="text-sm font-medium">
            {hasFilters
              ? "No complaints match your filters"
              : "No complaints yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {hasFilters
              ? "Try adjusting or clearing your filters."
              : "Submit a formal complaint about office operations or sheets."}
          </p>
          {!hasFilters && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="mt-4 h-7 text-xs"
            >
              <Link href="/complains/create">Submit your first complaint</Link>
            </Button>
          )}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="mt-3 h-7 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((complaint) => {
            const statusCfg = STATUS_CONFIG[complaint.status];
            const priorityCfg = PRIORITY_CONFIG[complaint.priority];

            return (
              <div
                key={complaint.id}
                className="group relative flex flex-col border rounded-xl bg-card p-4 gap-3 hover:border-foreground/20 hover:shadow-sm transition-all duration-150"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {complaint.uniqueId}
                    </span>
                  </div>
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${statusCfg.cls}`}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                </div>

                {/* Subject */}
                <div>
                  <h3 className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-foreground transition-colors">
                    {complaint.subject}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {complaint.message
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2.5">
                    {/* Priority dot */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium ${priorityCfg.cls}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`}
                      />
                      {complaint.priority.charAt(0) +
                        complaint.priority.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {new Date(complaint.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>

                    <ComplaintViewModal
                      isAdmin={isAdmin}
                      complaint={complaint}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">View complaint</span>
                        </Button>
                      }
                    />
                    <DeleteButton complaintId={complaint.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
            <span className="ml-1 text-muted-foreground/60">
              ({pagination.total} total)
            </span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - page) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="text-xs text-muted-foreground px-1"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ComplainsContainerForAdmin;
