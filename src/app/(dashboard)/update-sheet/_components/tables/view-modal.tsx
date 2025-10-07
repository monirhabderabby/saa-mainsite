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
import UpdateToBadge from "@/components/ui/update-to-badge";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { normalizeEditorHtml } from "@/lib/html-parse";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { htmlToText } from "html-to-text";
import { Check, Copy, Loader, Send } from "lucide-react";
import moment from "moment";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: UpdateSheetData;
  trigger: ReactNode;
}

const ViewUpdateSheetModal = ({ data, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlToText(data.message));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const normalizedHtml = normalizeEditorHtml(data.message);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="p-0">
        <ScrollArea className="max-h-[70vh] p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
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
              {data.commentFromOperation && (
                <ClipboardCopy
                  label="OP Comment"
                  value={data.commentFromOperation as string}
                />
              )}
              {data.commentFromSales && (
                <ClipboardCopy
                  label="Sales Comment"
                  value={data.commentFromSales as string}
                />
              )}
              {data.tlId && (
                <ClipboardCopy
                  label="TL Check"
                  value={data.tlBy?.fullName as string}
                />
              )}
              {/* <p className="text-sm">
                <span className="font-semibold">Update To: </span>
                <span className="text-muted-foreground">
                  <UpdateToBadge updateTo={data.updateTo} />
                </span>
              </p> */}

              {data.attachments && (
                <div className="text-sm">
                  <span className="font-semibold">Attachments: </span>
                  <Button asChild variant="link" effect="shine">
                    <a
                      href={data.attachments as string}
                      className="hover:text-blue-500 transition-colors duration-300 "
                      target="_blank"
                    >
                      {data.attachments?.slice(0, 40)}...
                    </a>
                  </Button>
                </div>
              )}

              {data.doneBy && (
                <ClipboardCopy
                  label="Done By"
                  value={data.doneBy?.fullName as string}
                />
              )}
            </div>
            <div className="flex flex-col justify-between">
              <p className="">
                {/* <span className="font-semibold">Update To: </span> */}
                <span className="text-muted-foreground">
                  <UpdateToBadge updateTo={data.updateTo} />
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-white/5 p-[20px] rounded-[8px] relative mt-5">
            <div className="absolute top-[20px] right-[20px]">
              <button
                onClick={handleCopy}
                className="relative p-1 rounded-md hover:bg-muted transition-colors duration-200 focus:outline-none"
                aria-label={copied ? "Copied!" : "Copy to clipboard"}
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
              </button>
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

        <AlertDialogFooter className="px-5 pb-5">
          <AlertDialogCancel>Close</AlertDialogCancel>

          {data.doneById ? (
            <Button disabled variant="outline">
              Sent ✅
            </Button>
          ) : data.tlId ? (
            <Button onClick={onMarkedAsSend} disabled={pending}>
              Mark as Sent{" "}
              {pending ? <Loader className="animate-spin" /> : <Send />}
            </Button>
          ) : (
            <Button disabled variant="ghost">
              Waiting for Tl Check....
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ViewUpdateSheetModal;
