"use client";

import { changeComplaintStatusAction } from "@/actions/complains/change-status";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "@/app/(dashboard)/complains/_components/complains-container";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComplaintWithCreator } from "@/hook/complains/use-get-my-complains";
import { normalizeEditorHtml } from "@/lib/html-parse"; // your existing util
import { cn } from "@/lib/utils";
import { ComplaintStatus } from "@prisma/client";
import { Check, FileText, Info, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

// ── Info row helper (mirrors ClipboardCopy visually, no copy action needed) ──
function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium text-foreground break-words",
          className,
        )}
      >
        {value}
      </span>
    </div>
  );
}

const STATUS_OPTIONS = [
  {
    value: "OPEN",
    label: "Open",
    dotCls: "bg-amber-500",
    activeCls: "bg-amber-100 border-amber-500 text-amber-800",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    dotCls: "bg-blue-500",
    activeCls: "bg-blue-100  border-blue-500  text-blue-800",
  },
  {
    value: "RESOLVED",
    label: "Resolved",
    dotCls: "bg-emerald-500",
    activeCls: "bg-emerald-100 border-emerald-500 text-emerald-800",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    dotCls: "bg-red-500",
    activeCls: "bg-red-100   border-red-500   text-red-800",
  },
];

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  complaint: ComplaintWithCreator;
  trigger: ReactNode;
  isAdmin: boolean;
}

// ── Modal ──────────────────────────────────────────────────────────────────────
const ComplaintViewModal = ({ complaint, trigger, isAdmin }: Props) => {
  const [pending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(
    complaint.status,
  );
  const [isSaving, setIsSaving] = useState(false);
  const statusCfg = STATUS_CONFIG[complaint.status];
  const priorityCfg = PRIORITY_CONFIG[complaint.priority];
  const normalizedHtml = normalizeEditorHtml(complaint.message);
  const creator = complaint.creator;
  const creatorName = creator.fullName;
  const creatorProfileImage = creator.image;
  const creatorServiceLine = creator.service?.name ?? "N/A";
  const creatorDesignation = creator.designation?.name ?? "N/A";
  const creatorDepartment = creator.department?.name ?? "N/A";
  const creatorEmployeeId = creator.employeeId;

  const onChangeStatus = () => {
    if (!selectedStatus) {
      toast.error("");
      return;
    }

    // changing the status
    startTransition(() => {
      changeComplaintStatusAction({
        complaintId: complaint.id,
        status: selectedStatus,
      }).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // handle success
        toast.success(res.message);
      });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="p-0 gap-0 max-w-[900px]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              Complaint Details
            </h2>
          </div>
          {/* Status badge in header for quick glance */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusCfg.cls}`}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
            {/* No X button needed — AlertDialog closes on outside click,
                but we keep one for usability */}
            <AlertDialogCancel asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </AlertDialogCancel>
          </div>
        </div>

        {/* ── Meta section ── */}
        <ScrollArea className="max-h-[70vh]">
          <div className="p-5 border-b border-border bg-muted/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InfoRow label="Complaint ID" value={complaint.uniqueId} />
              <InfoRow label="Subject" value={complaint.subject} />
              <InfoRow
                label="Priority"
                value={complaint.priority}
                className={priorityCfg.cls}
              />
              <InfoRow
                label="Submitted On"
                value={moment(complaint.createdAt).format(
                  "DD MMMM YYYY [at] hh:mm A",
                )}
              />
              {complaint.updatedAt &&
                complaint.updatedAt !== complaint.createdAt && (
                  <InfoRow
                    label="Last Updated"
                    value={moment(complaint.updatedAt).format(
                      "DD MMMM YYYY [at] hh:mm A",
                    )}
                  />
                )}
            </div>

            {/* ── Issuer ── */}
            <div className=" py-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2  gap-x-5">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {creatorProfileImage ? (
                    <Image
                      src={creatorProfileImage}
                      alt={creatorName}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                      height={40}
                      width={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {creatorName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name + designation */}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {creatorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creatorDesignation} ({creatorEmployeeId})
                    </p>
                  </div>
                </div>

                {/* Extra meta */}
                <div className=" grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoRow label="Department" value={creatorDepartment} />
                  <InfoRow label="Service Line" value={creatorServiceLine} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Supporting docs ── */}
          {complaint.supportingDocs?.length > 0 && (
            <div className="px-5 pt-4 pb-0 border-b border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Supporting Documents
              </h3>
              <div className="flex flex-wrap gap-2 pb-4">
                {complaint.supportingDocs.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-accent rounded-lg border border-border text-xs font-medium transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Admin: Update status ── */}
          {isAdmin && (
            <div className="px-5 py-4 border-b border-border bg-blue-50/20">
              <div className="flex items-center gap-1.5 mb-3">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-blue-500">
                  Admin · Update status
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {STATUS_OPTIONS.map(({ value, label, dotCls, activeCls }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedStatus(value as ComplaintStatus)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedStatus === value
                        ? activeCls + " border-[1.5px]"
                        : "bg-background border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", dotCls)} />
                    {label}
                  </button>
                ))}

                {/* Divider */}
                <div className="h-6 w-px bg-border mx-1" />

                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    selectedStatus === complaint.status || isSaving || pending
                  }
                  className={cn(
                    "gap-1.5 text-xs transition-all",
                    selectedStatus !== complaint.status &&
                      "border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100",
                  )}
                  onClick={() => {
                    setIsSaving(true);
                    onChangeStatus();
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  Save status
                </Button>
              </div>
            </div>
          )}

          {/* ── Message ── */}
          <div className="p-5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Message
            </h3>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: normalizedHtml }}
            />
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <AlertDialogFooter className="flex items-center py-3 px-5 bg-muted/30 border-t border-border">
          <section className="flex items-center justify-between w-full">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${
                  complaint.status === "RESOLVED"
                    ? "bg-emerald-500"
                    : complaint.status === "REJECTED"
                      ? "bg-red-500"
                      : complaint.status === "IN_PROGRESS"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                }`}
              />
              {complaint.status === "OPEN" && "Awaiting review"}
              {complaint.status === "IN_PROGRESS" && "Being reviewed"}
              {complaint.status === "RESOLVED" &&
                "This complaint has been resolved"}
              {complaint.status === "REJECTED" && "This complaint was rejected"}
            </div>

            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </AlertDialogCancel>
          </section>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ComplaintViewModal;
