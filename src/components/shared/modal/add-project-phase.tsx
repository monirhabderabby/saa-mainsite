"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createPhase, updatePhase } from "@/actions/tools/fsd-projects/phase";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  AddProjectPhaseSchema,
  addProjectPhaseSchema,
} from "@/schemas/tools/fsd-projects/project-phase-create";
import { projectPhase } from "@prisma/client";
import { Layers, Loader, Plus, Save, Sheet } from "lucide-react";
import { toast } from "sonner";

interface AddProjectPhaseProps {
  projectId: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
  defaultOpen?: boolean;
  initialdata?: projectPhase;
}

export default function AddProjectPhase({
  projectId,
  trigger,
  defaultOpen,
  initialdata,
}: AddProjectPhaseProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [isLoading, startTransition] = useTransition();

  const form = useForm<AddProjectPhaseSchema>({
    resolver: zodResolver(addProjectPhaseSchema),
    defaultValues: {
      projectId,
      title: "",
      willBeDeliver: "",
      orderId: "",
      value: undefined,
      monetaryValue: undefined,
      instructionSheet: "",
      status: "Pending",
    },
  });

  const onSubmit = async (values: AddProjectPhaseSchema) => {
    if (initialdata) {
      // edit server action
      startTransition(() => {
        updatePhase(initialdata.id, values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          setOpen(false);
          form.reset();
        });
      });
    } else {
      startTransition(() => {
        createPhase(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          form.reset();
          toast.success(res.message);
          setOpen(false);
        });
      });
    }
  };

  const value = form.watch("value");

  useEffect(() => {
    if (!value) return;

    form.setValue("monetaryValue", value * 0.8);
  }, [value, form]);

  useEffect(() => {
    if (!initialdata) return;

    form.reset({
      projectId,
      title: initialdata.title,
      willBeDeliver: initialdata.willBeDeliver,
      orderId: initialdata.orderId ?? undefined,
      value: initialdata.value,
      monetaryValue: initialdata.monetaryValue,
      instructionSheet: initialdata.instructionSheet ?? undefined,
      status: initialdata?.status,
    });
  }, [form, initialdata, projectId]);

  // Add this useEffect
  useEffect(() => {
    if (!open) {
      form.reset({
        projectId,
        title: initialdata?.title ?? "",
        willBeDeliver: initialdata?.willBeDeliver ?? "",
        orderId: initialdata?.orderId ?? "",
        value: initialdata?.value ?? undefined,
        monetaryValue: initialdata?.monetaryValue ?? undefined,
        instructionSheet: initialdata?.instructionSheet ?? "",
        status: initialdata?.status ?? "Pending",
      });
    }
  }, [open, form, projectId, initialdata]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!initialdata && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" /> {initialdata ? "Edit" : "Add"}{" "}
            Project Phase
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Phase title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Will Be Deliver */}
            <FormField
              control={form.control}
              name="willBeDeliver"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="What will be delivered?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order ID (optional) */}
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Order ID (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Values */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Value eg: 320"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monetaryValue"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        {...field}
                        placeholder="Monetary Value eg: 320"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instruction Sheet */}
            <FormField
              control={form.control}
              name="instructionSheet"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput {...field} />
                      <InputGroupAddon>
                        <Sheet className="text-[#00AC47]" />
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden projectId */}
            <input type="hidden" {...form.register("projectId")} />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {initialdata ? "Save Now" : "Add Phase"}
                {isLoading ? (
                  <Loader className="ml-2 h-4 w-4 animate-spin" />
                ) : initialdata ? (
                  <Save className="ml-2 h-4 w-4" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
