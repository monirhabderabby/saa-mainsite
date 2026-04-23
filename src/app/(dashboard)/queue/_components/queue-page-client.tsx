// components/queue/queue-page-client.tsx
"use client";

import { useState, useTransition } from "react";

import { deleteQueueAction } from "@/actions/queue/delete";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import AlertModal from "@/components/ui/custom/alert-modal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAllQueues } from "@/hook/queues/use-delete-ll-queues";
import { QueueWithRelations, useGetQueues } from "@/hook/queues/use-get-queues";
import { cn } from "@/lib/utils";
import { Profile, Role } from "@prisma/client";
import {
  Check,
  ChevronsUpDown,
  Inbox,
  ListFilter,
  PlusCircle,
  RefreshCw,
  Search,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { AddQueueModal } from "./modals/add-queue-modal";
import SubmitLinksModal from "./modals/submit-links";
import { QueueCard } from "./queue-card";

interface QueuePageClientProps {
  userRole: Role;
  currentUserId: string;
  profiles: Profile[];
  defaultSelectedProfiles: string[];
  isAccess: boolean;
}

type StatusFilter = "ALL" | "REQUESTED" | "GIVEN";

export function QueuePageClient({
  userRole,
  currentUserId,
  profiles,
  defaultSelectedProfiles,
  isAccess,
}: QueuePageClientProps) {
  // Modal states
  const [queueModal, setQueueModal] = useState<{
    open: boolean;
    queue: QueueWithRelations | null; // null = create, non-null = edit
  }>({ open: false, queue: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    queue: QueueWithRelations | null;
  }>({ open: false, queue: null });

  const [linksModal, setLinksModal] = useState<{
    open: boolean;
    queue: QueueWithRelations | null;
  }>({ open: false, queue: null });

  // Filter states (these drive the API query)
  const [search, setSearch] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(
    defaultSelectedProfiles ?? [],
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    userRole === "SALES_MEMBER" ? "REQUESTED" : "ALL",
  );

  const [deleteAllDialog, setDeleteAllDialog] = useState(false);

  const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllQueues();
  const [deleting, startTransition] = useTransition();

  const { data, isLoading, isError, refetch, isFetching } = useGetQueues({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    // Pass search as clientName filter; extend as needed
    searchQuery: search || undefined,
    profileIds: selectedProfiles.length
      ? selectedProfiles.join(",")
      : undefined,
    limit: 50,
  });

  const queues = data?.data ?? [];

  const isOperation = userRole === "OPERATION_MEMBER";
  const isSales = userRole === "SALES_MEMBER" || userRole === "ADMIN";

  // ✅ Use real counts from the API, not client-side filtering
  const counts = {
    all: data?.counts?.all ?? 0,
    requested: data?.counts?.requested ?? 0,
    given: data?.counts?.given ?? 0,
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDelete = () => {
    const queueId = deleteDialog.queue?.id;

    if (!queueId) {
      toast.error("No Queue key found");
      return;
    }
    startTransition(() => {
      deleteQueueAction(queueId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        setDeleteDialog((prev) => ({ ...prev, open: false, queue: null }));
        handleSuccess();
      });
    });
  };

  const handleDeleteAll = () => {
    deleteAll(undefined, {
      onSuccess: (res) => {
        toast.success(res.message);
        setDeleteAllDialog(false);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const isQueueCreateEnabled = isAccess && !["SALES_MEMBER"].includes(userRole);

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Queue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSales
                ? "Manage all client queue requests"
                : "Your submitted queue requests"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
            {isQueueCreateEnabled && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setQueueModal({ open: true, queue: null })}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Create Queue
              </Button>
            )}

            {queues.length > 0 && (
              <Button
                variant="link"
                className="h-7 text-xs gap-1.5"
                onClick={() => setDeleteAllDialog(true)} // ← add this
              >
                Delete All
                <Trash />
              </Button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: "Total",
              value: counts.all,
              filter: "ALL" as StatusFilter,
            },
            {
              label: "Requested",
              value: counts.requested,
              filter: "REQUESTED" as StatusFilter,
            },
            {
              label: "Given",
              value: counts.given,
              filter: "GIVEN" as StatusFilter,
            },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setStatusFilter(stat.filter)}
              className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors ${
                statusFilter === stat.filter
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
              }`}
            >
              <span className="text-[11px] text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-lg font-semibold tabular-nums leading-tight">
                {stat.value}
              </span>
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              startIcon={Search}
              placeholder="Search by client name, order ID, or queue key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
          <div>
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-full justify-between text-xs",
                    selectedProfiles.length === 0 && "text-muted-foreground",
                  )}
                >
                  {selectedProfiles.length > 0
                    ? `${selectedProfiles.length} selected`
                    : "Select profiles"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                side="bottom"
                align="start"
                className="w-[250px] p-0"
              >
                <Command>
                  <CommandInput placeholder="Search profiles..." />
                  <CommandList className="max-h-60 overflow-y-auto">
                    <CommandEmpty>No profile found.</CommandEmpty>

                    <CommandGroup>
                      {profiles.map((p) => {
                        const isSelected = selectedProfiles.includes(p.id);

                        return (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              setSelectedProfiles((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== p.id)
                                  : [...prev, p.id],
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-32 text-xs gap-1">
              <ListFilter className="h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL" className="text-xs">
                All Status
              </SelectItem>
              <SelectItem value="REQUESTED" className="text-xs">
                Requested
              </SelectItem>
              <SelectItem value="GIVEN" className="text-xs">
                Given
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Inbox className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Failed to load queues
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Something went wrong. Please try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : queues.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No queues found
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {search || statusFilter !== "ALL"
                    ? "Try adjusting your filters"
                    : isOperation
                      ? "Create your first queue request"
                      : "No requests have been submitted yet"}
                </p>
              </div>
              {isOperation && !search && statusFilter === "ALL" && (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 mt-1"
                  onClick={() => setQueueModal({ open: true, queue: null })}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Create Queue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 pb-4 gap-5">
              {queues.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue as QueueWithRelations}
                  userRole={userRole}
                  currentUserId={currentUserId}
                  onSubmitLinks={() => setLinksModal({ open: true, queue })}
                  onEdit={() => setQueueModal({ open: true, queue })}
                  onDelete={() => setDeleteDialog({ open: true, queue })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Unified create / edit modal */}
        <AddQueueModal
          open={queueModal.open}
          onOpenChange={(open) => setQueueModal((prev) => ({ ...prev, open }))}
          queue={queueModal.queue}
          profiles={profiles}
          onSuccess={handleSuccess}
        />

        {/* Submit links modal (sales) */}
        <SubmitLinksModal
          open={linksModal.open}
          onOpenChange={(open) => setLinksModal((prev) => ({ ...prev, open }))}
          queue={linksModal.queue}
          onSuccess={handleSuccess}
        />

        <AlertModal
          isOpen={deleteDialog.open}
          onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Queue"
          message={`Are you sure you want to delete ${deleteDialog.queue?.queueKey}? This action cannot be undone and will also remove all associated links.`}
        />

        <AlertModal
          isOpen={deleteAllDialog}
          onClose={() => setDeleteAllDialog(false)}
          onConfirm={handleDeleteAll}
          loading={isDeletingAll}
          title="Delete All Queues"
          message="Are you sure you want to delete all your queues? This action cannot be undone and will remove all associated links."
        />
      </div>
    </>
  );
}
