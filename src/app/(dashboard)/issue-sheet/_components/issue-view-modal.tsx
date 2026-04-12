"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { cn } from "@/lib/utils";
import { IssueStatus, RiskLevel } from "@prisma/client";
import {
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Inbox,
  MessageSquare,
  ShieldAlert,
  ShoppingCart,
  User,
  Users,
  Video,
} from "lucide-react";
import moment from "moment";
import IssueActivityPanel from "./issue-activity-panel";

interface Props {
  data: IssueSheetData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusConfig = (status: IssueStatus) => {
  const configs: Record<
    IssueStatus,
    { label: string; className: string }
  > = {
    open: {
      label: "Open",
      className:
        "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/10",
    },
    wip: {
      label: "In Progress",
      className:
        "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10",
    },
    done: {
      label: "Done",
      className:
        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/10",
    },
    dispute: {
      label: "Dispute",
      className:
        "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/10",
    },
  };
  return configs[status] ?? configs.open;
};

const getRiskConfig = (risk: RiskLevel) => {
  const configs: Record<
    RiskLevel,
    { label: string; className: string; dotColor: string }
  > = {
    low: {
      label: "Low",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10",
      dotColor: "bg-emerald-500",
    },
    medium: {
      label: "Medium",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10",
      dotColor: "bg-amber-500",
    },
    high: {
      label: "High",
      className:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/10",
      dotColor: "bg-orange-500",
    },
    critical: {
      label: "Critical",
      className:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/10",
      dotColor: "bg-red-500",
    },
  };
  return configs[risk] ?? configs.low;
};

const DetailRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  </div>
);

const LinkButton = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 transition-colors group"
  >
    <span className="group-hover:underline">{label}</span>
    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
  </a>
);

const IssueViewModal = ({ data, open, onOpenChange }: Props) => {
  const statusConfig = getStatusConfig(data.status);
  const riskConfig = getRiskConfig(data.riskLevel);
  const createdAt = moment(data.createdAt);
  const updatedAt = moment(data.updatedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-semibold">
                  {data.clientName}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs font-medium border",
                    statusConfig.className
                  )}
                >
                  {statusConfig.label}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs font-medium border cursor-default gap-1.5",
                    riskConfig.className
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", riskConfig.dotColor)} />
                  {riskConfig.label} Risk
                </Badge>
              </div>
              {data.orderId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Order #{data.orderId}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body: Two-column layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Issue Details */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4 space-y-1">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Created
                    </p>
                    <p className="text-sm font-medium">
                      {createdAt.format("DD MMM, YYYY")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {updatedAt.fromNow()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Detail Rows */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <DetailRow icon={User} label="Profile">
                  <span className="font-medium">{data.profile.name}</span>
                </DetailRow>

                <DetailRow icon={FileText} label="Service">
                  <Badge variant="secondary" className="font-medium">
                    {data.service.name}
                  </Badge>
                </DetailRow>

                <DetailRow icon={Users} label="Team">
                  {data.team ? (
                    <span className="font-medium">{data.team.name}</span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      No team assigned
                    </span>
                  )}
                </DetailRow>

                <DetailRow icon={ShieldAlert} label="Risk Level">
                  <Badge
                    className={cn(
                      "text-xs font-medium border cursor-default gap-1.5",
                      riskConfig.className
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", riskConfig.dotColor)} />
                    {riskConfig.label}
                  </Badge>
                </DetailRow>

                {data.statusChangedBy && (
                  <DetailRow icon={User} label="Status Changed By">
                    <div className="space-y-0.5">
                      <span className="font-medium">
                        {data.statusChangedBy.fullName}
                      </span>
                      {data.statusChangedBy.designation && (
                        <span className="text-muted-foreground text-xs ml-2">
                          ({data.statusChangedBy.designation.name})
                        </span>
                      )}
                      {data.statusChangedAt && (
                        <p className="text-xs text-muted-foreground">
                          {moment(data.statusChangedAt).format(
                            "DD MMM, YYYY [at] hh:mm A"
                          )}
                        </p>
                      )}
                    </div>
                  </DetailRow>
                )}

                {data.reference && (
                  <div className="col-span-2">
                    <DetailRow icon={FileText} label="Reference">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {data.reference}
                      </p>
                    </DetailRow>
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              {/* Links Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Links
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {data.orderPageUrl && (
                    <DetailRow icon={ShoppingCart} label="Order Page">
                      <LinkButton
                        href={data.orderPageUrl}
                        label="Open Order Page"
                      />
                    </DetailRow>
                  )}
                  {data.inboxPageUrl && (
                    <DetailRow icon={Inbox} label="Inbox Page">
                      <LinkButton
                        href={data.inboxPageUrl}
                        label="Open Inbox Page"
                      />
                    </DetailRow>
                  )}
                  {data.fileOrMeetingLink && (
                    <DetailRow icon={Video} label="File / Meeting Link">
                      <LinkButton
                        href={data.fileOrMeetingLink}
                        label="Open Link"
                      />
                    </DetailRow>
                  )}
                  {!data.orderPageUrl &&
                    !data.inboxPageUrl &&
                    !data.fileOrMeetingLink && (
                      <p className="text-sm text-muted-foreground italic py-2">
                        No links available
                      </p>
                    )}
                </div>
              </div>

              <Separator className="my-3" />

              {/* Notes Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Notes
                </p>

                {data.specialNotes && (
                  <DetailRow icon={AlertTriangle} label="Special Notes">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {data.specialNotes}
                    </p>
                  </DetailRow>
                )}

                {data.noteForSales && (
                  <DetailRow icon={MessageSquare} label="Note for Sales">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {data.noteForSales}
                    </p>
                  </DetailRow>
                )}

                {!data.specialNotes && !data.noteForSales && (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No notes added
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Right: Activity Panel */}
          <IssueActivityPanel issueSheetId={data.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueViewModal;
