// components/queue/modals/add-queue-modal.tsx
"use client";

import { useEffect, useState, useTransition } from "react";

import { createQueueAction } from "@/actions/queue/create";
import { editQueueAction } from "@/actions/queue/edit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { Queue } from "@/types/queue";
import { Profile } from "@prisma/client";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Pencil,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AddQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue?: Queue | null;
  profiles: Profile[];
  onSuccess?: () => void;
}

interface FormState {
  profileId: string;
  clientName: string;
  orderId: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  profileId: "",
  clientName: "",
  orderId: "",
  message: "",
};

export function AddQueueModal({
  open,
  onOpenChange,
  queue,
  profiles,
  onSuccess,
}: AddQueueModalProps) {
  const isEditMode = !!queue;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

  // Sync form when switching between create / edit
  useEffect(() => {
    if (open) {
      setForm(
        isEditMode
          ? {
              profileId: queue.profileId,
              clientName: queue.clientName,
              orderId: queue.orderId ?? "",
              message: queue.message,
            }
          : EMPTY_FORM,
      );
    }
  }, [open, queue, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (!isPending) {
      setProfilePopoverOpen(false);
      onOpenChange(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === form.profileId);

  const handleSubmit = () => {
    startTransition(async () => {
      if (isEditMode) {
        const result = await editQueueAction({
          queueId: queue.id,
          profileId: form.profileId.trim(),
          clientName: form.clientName.trim(),
          orderId: form.orderId.trim() || undefined,
          message: form.message.trim(),
        });

        if (result.success) {
          toast.success(result.message);
          onOpenChange(false);

          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createQueueAction({
          profileId: form.profileId.trim(),
          clientName: form.clientName.trim(),
          orderId: form.orderId.trim() || undefined,
          message: form.message.trim(),
        });

        if (result.success) {
          toast.success(result.message, {
            description: `Key: ${result.data?.queueKey}`,
          });

          onOpenChange(false);
          // queryClient.setQueriesData(
          //   { queryKey: ["queues"] },
          //   (oldData: GetQueuesResponse | undefined) => {
          //     if (!oldData) return oldData;

          //     return {
          //       ...oldData,
          //       data: [result.data, ...oldData.data], // 🔥 add to top
          //       pagination: {
          //         ...oldData.pagination,
          //         total: oldData.pagination.total + 1,
          //       },
          //     };
          //   },
          // );

          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                isEditMode ? "bg-orange-500/10" : "bg-primary/10"
              }`}
            >
              {isEditMode ? (
                <Pencil className="h-3.5 w-3.5 text-orange-500" />
              ) : (
                <PlusCircle className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold leading-none">
                {isEditMode ? "Edit Queue" : "Create Queue"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-none">
                {isEditMode
                  ? `Editing ${queue.queueKey}`
                  : "Submit a new request for the sales team."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Profile */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Profile <span className="text-destructive">*</span>
            </Label>
            <Popover
              open={profilePopoverOpen}
              onOpenChange={setProfilePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={profilePopoverOpen}
                  className="w-full h-8 justify-between text-xs font-normal px-3"
                  disabled={isPending}
                >
                  {selectedProfile ? (
                    <span className="text-foreground truncate">
                      {selectedProfile.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select a profile...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search profile..."
                    className="h-8 text-xs"
                  />
                  <CommandList>
                    <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                      No profile found.
                    </CommandEmpty>
                    <CommandGroup>
                      {profiles.map((profile) => (
                        <CommandItem
                          key={profile.id}
                          // value drives the Command search — use name so typing filters by name
                          value={profile.name}
                          onSelect={() => {
                            setForm((prev) => ({
                              ...prev,
                              profileId:
                                prev.profileId === profile.id ? "" : profile.id,
                            }));
                            setProfilePopoverOpen(false);
                          }}
                          className="text-xs"
                        >
                          <Check
                            className={`mr-2 h-3 w-3 shrink-0 transition-opacity ${
                              form.profileId === profile.id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {profile.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="q-clientName"
              className="text-xs font-medium text-foreground"
            >
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="q-clientName"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
              className="h-8 text-xs"
              disabled={isPending}
            />
          </div>

          {/* Order ID */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor="q-orderId"
                className="text-xs font-medium text-foreground"
              >
                Order ID
              </Label>
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] font-normal text-muted-foreground"
              >
                Optional
              </Badge>
            </div>
            <Input
              id="q-orderId"
              name="orderId"
              value={form.orderId}
              onChange={handleChange}
              placeholder="e.g. ORD-9876"
              className="h-8 text-xs"
              disabled={isPending}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label
              htmlFor="q-message"
              className="text-xs font-medium text-foreground"
            >
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="q-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe what you need from the sales team..."
              className="text-xs resize-none min-h-[80px]"
              disabled={isPending}
            />
          </div>
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
                {isEditMode ? "Saving..." : "Creating..."}
              </>
            ) : isEditMode ? (
              <>
                <Pencil className="h-3 w-3" />
                Save Changes
              </>
            ) : (
              <>
                <PlusCircle className="h-3 w-3" />
                Create Queue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
