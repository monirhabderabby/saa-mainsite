"use client";
import { markAsSent } from "@/actions/update-sheet/mark-as-sent";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "@/components/ui/custom/clipboard-copy";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";

import { normalizeEditorHtml } from "@/lib/html-parse";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { AddSalesNote } from "@/actions/update-sheet/add-sales-note";
import { Role } from "@prisma/client";
import { htmlToText } from "html-to-text";
import {
  Check,
  Copy,
  ExternalLink,
  FolderOpen,
  Loader,
  Send,
  X,
} from "lucide-react";
import moment from "moment";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import AddNotePopoverForSales from "./_components/add-note-for-sales";

interface Props {
  data: UpdateSheetData;
  trigger: ReactNode;
  currentUserRole: Role;
}

const allowedSalesNoteRoles = [
  "ADMIN",
  "SUPER_ADMIN",
  "SALES_MEMBER",
] as Role[];
const allowedMarkAsSent = ["SALES_MEMBER", "ADMIN", "SUPER_ADMIN"] as Role[];

const ViewUpdateSheetModal = ({
  data: dbData,
  trigger,
  currentUserRole,
}: Props) => {
  const [data, setData] = useState(dbData);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlToText(data.message));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const onMarkedAsSend = () => {
    startTransition(async () => {
      const res = await markAsSent(data.id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        icon: "✅",
      });
      queryClient.invalidateQueries({ queryKey: ["update-entries"] });
    });
  };

  const onAddNoteSales = (note: string) => {
    startTransition(() => {
      AddSalesNote({
        note,
        messageId: data.id,
      }).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // handle success
        setData((prev) => {
          return {
            ...prev,
            commentFromSales: note,
          };
        });
      });
    });
  };

  const normalizedHtml = normalizeEditorHtml(data.message);

  const isAccessForNote = allowedSalesNoteRoles.includes(currentUserRole);
  const isAccessForMarkAsSent = allowedMarkAsSent.includes(currentUserRole);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="p-0 gap-0">
        <div className="flex items-center justify-between px-6 py-4  border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Message Details
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh] ">
          <div className=" p-5  border-b border-border bg-muted/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClipboardCopy label="Profile Name" value={data.profile.name} />
              <ClipboardCopy
                label="Client Name"
                value={data.clientName}
                clipboard
              />
              <ClipboardCopy label="Order ID" value={data.orderId} clipboard />
              <ClipboardCopy
                label="Updated By"
                value={data.updateBy.fullName as string}
              />

              {data.tlId && (
                <ClipboardCopy
                  label="TL Check"
                  value={data.tlBy?.fullName as string}
                />
              )}
              {data.commentFromOperation && (
                <ClipboardCopy
                  label="OP Comment"
                  value={data.commentFromOperation as string}
                />
              )}
              <ClipboardCopy
                label="Message sent to "
                value={data.updateTo}
                badge
              />
              {data.commentFromSales && (
                <ClipboardCopy
                  label="Sales Comment"
                  value={data.commentFromSales as string}
                />
              )}
              <div className="">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Attachments
                </h3>
                <a
                  href={data.attachments as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-accent rounded-lg border border-border transition-colors group"
                >
                  <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-sm font-medium text-foreground">
                    Open Attachments
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* message */}
          <div className="p-5 rounded-[8px] relative ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Completion Message
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-2 text-xs"
              >
                <div className="relative w-4 h-4">
                  <Copy
                    className={cn(
                      "absolute inset-0 w-4 h-4 text-muted-foreground transition-all duration-300",
                      copied
                        ? "scale-0 opacity-0 rotate-180"
                        : "scale-100 opacity-100 rotate-0"
                    )}
                  />
                  <Check
                    className={cn(
                      "absolute inset-0 w-4 h-4 text-green-600 transition-all duration-300",
                      copied
                        ? "scale-100 opacity-100 rotate-0"
                        : "scale-0 opacity-0 rotate-180"
                    )}
                  />
                </div>
                {copied ? "Copied" : "Copy Message"}
              </Button>
            </div>

            {/* ✅ Use normalized & styled HTML */}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: normalizedHtml }}
            />
          </div>

          {data.sendAt && (
            <p className="mt-5 text-[14px] text-muted-foreground">
              This message was sent to the client on{" "}
              <span className="font-medium text-green-500">
                {moment(data.sendAt).format("DD MMMM YYYY [at] hh:mm A")}
              </span>
            </p>
          )}
        </ScrollArea>

        <AlertDialogFooter className="flex items-center py-3 px-5 bg-muted/30 border-t border-border">
          <section className="flex items-center justify-between w-full">
            {!data.doneById && !data.tlId ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Waiting for the Tl Check...
              </div>
            ) : !data.doneById && data.tlId ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Waiting for sending message...
              </div>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-x-3">
              <AlertDialogCancel>Close</AlertDialogCancel>

              {data.doneById ? (
                <Button disabled variant="outline" size="sm">
                  Sent ✅
                </Button>
              ) : data.tlId ? (
                <>
                  {isAccessForMarkAsSent && (
                    <Button
                      onClick={onMarkedAsSend}
                      disabled={pending}
                      size="sm"
                    >
                      Mark as Sent{" "}
                      {pending ? <Loader className="animate-spin" /> : <Send />}
                    </Button>
                  )}
                  {isAccessForNote && (
                    <AddNotePopoverForSales
                      initialData={data.commentFromSales}
                      onSubmit={onAddNoteSales}
                    />
                  )}
                </>
              ) : (
                isAccessForNote && (
                  <AddNotePopoverForSales
                    initialData={data.commentFromSales}
                    onSubmit={onAddNoteSales}
                  />
                )
              )}
            </div>
          </section>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ViewUpdateSheetModal;
