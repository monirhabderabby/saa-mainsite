"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, ExternalLink, Link2, Loader, Send } from "lucide-react";
import { useState } from "react";

interface MarkAsSentReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (referenceLink: string) => void;
  isPending?: boolean;
}

const MarkAsSentReferenceModal = ({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: MarkAsSentReferenceModalProps) => {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    const trimmed = link.trim();
    if (!trimmed) {
      setError("Please enter a reference link before confirming.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL (e.g. https://prnt.sc/chat/...)");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  const handleChange = (value: string) => {
    setLink(value);
    if (error) setError("");
  };

  const handleOpenChange = (val: boolean) => {
    if (!isPending) {
      setLink("");
      setError("");
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                Add Reference Link
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Paste the conversation or proof link before marking as sent.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 px-3.5 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              This reference will be attached to the record permanently. Make
              sure the link is accessible before submitting.
            </p>
          </div>

          {/* Input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reference-link"
              className="text-sm font-medium text-foreground"
            >
              Reference Link{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <div className="relative">
              <Link2
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors",
                  error
                    ? "text-destructive"
                    : link
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              />
              <Input
                id="reference-link"
                placeholder="https://prnt.sc/..."
                value={link}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isPending) handleSubmit();
                }}
                disabled={isPending}
                className={cn(
                  "pl-5 pr-10 h-10 text-sm transition-all",
                  error
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "",
                )}
                autoFocus
              />
              {link && isValidUrl(link) && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="h-9 px-4"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !link.trim()}
            className="h-9 px-4 gap-2 min-w-[130px]"
          >
            {isPending ? (
              <>
                <Loader className="h-3.5 w-3.5 animate-spin" />
                Marking…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Confirm & Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsSentReferenceModal;
