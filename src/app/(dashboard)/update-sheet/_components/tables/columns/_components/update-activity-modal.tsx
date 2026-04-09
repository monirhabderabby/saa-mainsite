"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Hash, User } from "lucide-react";
import UpdateActivityPanel from "./update-activity-panel";

interface Props {
  updateSheetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  orderId?: string;
  profileName?: string;
}

const UpdateActivityModal = ({
  updateSheetId,
  open,
  onOpenChange,
  clientName,
  orderId,
  profileName,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-[95vw] p-0 gap-0 overflow-hidden h-[80vh] flex flex-col">
        {/* Header with client info */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                {clientName || "Activity Log"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {clientName
                  ? "Activity timeline"
                  : "Comments & updates"}
              </DialogDescription>
            </div>
          </div>

          {/* Client details chips */}
          {(orderId || profileName) && (
            <div className="flex items-center gap-2 flex-wrap mt-2.5">
              {orderId && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 border border-border/50 rounded-md px-2 py-1">
                  <Hash className="w-3 h-3 text-muted-foreground/60" />
                  <span className="font-mono">{orderId}</span>
                </div>
              )}
              {profileName && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 border border-border/50 rounded-md px-2 py-1">
                  <User className="w-3 h-3 text-muted-foreground/60" />
                  <span>{profileName}</span>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Activity Panel */}
        <div className="flex-1 min-h-0 flex flex-col">
          <UpdateActivityPanel updateSheetId={updateSheetId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateActivityModal;
