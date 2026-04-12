// components/queue/submitLinksModal.tsx
"use client";

import { submitQueueLinksAction } from "@/actions/queue/submit-queue-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QueueWithRelations } from "@/hook/queues/use-get-queues";
import { Link2, Loader2, Plus, SendHorizonal, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const LINK_TITLE_SUGGESTIONS = [
  "Conversation",
  "Attachment",
  "Meeting Link",
  "Fiverr Support Message",
  "Full Order Page",
  "Full Inbox Page",
  "Other",
];

interface LinkEntry {
  id: string;
  title: string;
  url: string;
}

interface SubmitLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: QueueWithRelations | null;
  onSuccess?: () => void;
}

export default function SubmitLinksModal({
  open,
  onOpenChange,
  queue,
  onSuccess,
}: SubmitLinksModalProps) {
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState<LinkEntry[]>([
    { id: crypto.randomUUID(), title: "", url: "" },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  // Pre-populate with existing links if editing
  useEffect(() => {
    if (open && queue?.links?.length) {
      setLinks(
        queue.links.map((l) => ({ id: l.id, title: l.title, url: l.url })),
      );
    } else if (open) {
      setLinks([{ id: crypto.randomUUID(), title: "", url: "" }]);
    }
  }, [open, queue]);

  const addLink = () => {
    setLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", url: "" },
    ]);
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    links.forEach((l, i) => {
      if (!l.title.trim()) errs.push(`Link ${i + 1}: Title is required`);
      if (!l.url.trim()) errs.push(`Link ${i + 1}: URL is required`);
    });
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    startTransition(async () => {
      if (!queue) return;
      const result = await submitQueueLinksAction({
        queueId: queue.id,
        links: links.map(({ title, url }) => ({ title, url })),
      });

      if (result.success) {
        toast.success(result.message || "Links submitted");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to submit links");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setErrors([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
              <Link2 className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold leading-none">
                Submit Links
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-none">
                {queue?.queueKey} — {queue?.clientName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Queue info strip */}
        {queue && (
          <div className="px-5 py-2.5 bg-muted/30 border-b border-border/40 flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Profile:{" "}
              <span className="text-foreground font-medium">
                {queue.profile.name}
              </span>
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="truncate max-w-[200px]">{queue.message}</span>
          </div>
        )}

        {/* Links */}
        <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
          {links.map((link, index) => (
            <div className="space-y-2" key={index}>
              <div className="flex items-center gap-2">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Title
                    </Label>
                    <Select
                      value={link.title}
                      onValueChange={(val) => updateLink(link.id, "title", val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LINK_TITLE_SUGGESTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      URL
                    </Label>
                    <Input
                      value={link.url}
                      onChange={(e) =>
                        updateLink(link.id, "url", e.target.value)
                      }
                      placeholder="https://..."
                      className="h-8 text-xs"
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Trash button aligned right */}
                {links.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-5 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLink(link.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs gap-1.5 mt-1 border-dashed"
            onClick={addLink}
            disabled={isPending}
          >
            <Plus className="h-3 w-3" />
            Add Another Link
          </Button>

          {errors.length > 0 && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 space-y-0.5">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3.5 border-t border-border/60 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendHorizonal className="h-3 w-3" />
                Submit &amp; Mark Given
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
