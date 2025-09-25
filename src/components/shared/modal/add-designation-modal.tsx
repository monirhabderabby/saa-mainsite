"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createDesignationAction } from "@/actions/designation/create";
import { editDesignationAction } from "@/actions/designation/edit";
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
  designationSchema,
  DesignationSchemaType,
} from "@/schemas/designation";
import { Loader, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AddMemberModalProps {
  serviceId: string;
  serviceName: string;
  trigger?: React.ReactNode;
  initialData?: { name: string; id: string };
  onClose?: () => void;
}

export default function AddDesignationModal({
  serviceId,
  trigger,
  serviceName,
  initialData,
  onClose,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const form = useForm<DesignationSchemaType>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      serviceId,
      name: initialData?.name ?? "",
    },
  });

  const onSubmit = async (values: DesignationSchemaType) => {
    if (initialData) {
      startTransition(() => {
        editDesignationAction({
          ...values,
          id: initialData.id,
        }).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          setOpen(false);
          form.reset({});
          onClose?.();
        });
      });
    } else {
      startTransition(() => {
        createDesignationAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          setOpen(false);
          form.reset({});
          onClose?.();
        });
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> {initialData ? "Edit" : "Add"}{" "}
            Designation under {serviceName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-select members */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Select Members
                  </FormLabel> */}
                  <FormControl>
                    <Input {...field} placeholder="Write a designation name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {initialData ? "Save" : "Add"} Designation{" "}
                {isLoading ? <Loader className="animate-spin" /> : <Plus />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
