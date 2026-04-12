"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { useState } from "react";

interface IssueDoneReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (referenceText: string) => void;
  isPending?: boolean;
}

const IssueDoneReferenceModal = ({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: IssueDoneReferenceModalProps) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter a reference note before confirming.");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  const handleChange = (value: string) => {
    setText(value);
    if (error) setError("");
  };

  const handleOpenChange = (val: boolean) => {
    if (!isPending) {
      setText("");
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
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                Mark Issue as Done
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Add a reference note before marking this issue as done.
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
              This reference note will be attached to the record permanently.
              Please provide details about the resolution before submitting.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reference-note"
              className="text-sm font-medium text-foreground"
            >
              Reference Note{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <div className="relative">
              <Textarea
                id="reference-note"
                placeholder="Describe the resolution or add any relevant notes..."
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isPending}
                className={cn(
                  "min-h-[120px] text-sm resize-none transition-all",
                  error
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "",
                )}
                autoFocus
              />
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
            disabled={isPending || !text.trim()}
            className="h-9 px-4 gap-2 min-w-[130px]"
          >
            {isPending ? (
              <>
                <Loader className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirm Done
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDoneReferenceModal;
