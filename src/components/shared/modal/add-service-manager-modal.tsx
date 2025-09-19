"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AddManagerAction } from "@/actions/services/add-manager";
import { editManagerAction } from "@/actions/services/edit-manager";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addManagerSchema, AddManagerSchemaType } from "@/schemas/services";
import { Prisma } from "@prisma/client";
import { Loader, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

type UserTypes = Prisma.UserGetPayload<{
  select: {
    id: true;
    fullName: true;
    employeeId: true;
  };
}>;

interface AddMemberModalProps {
  serviceId: string;
  serviceName: string;
  users: UserTypes[]; // from backend
  trigger?: React.ReactNode;
  initialManagerId?: string;
}

export default function AddServiceManagerModal({
  serviceId,
  serviceName,
  users,
  trigger,
  initialManagerId,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const form = useForm<AddManagerSchemaType>({
    resolver: zodResolver(addManagerSchema),
    defaultValues: {
      serviceId,
      serviceManagerId: initialManagerId ?? "",
    },
  });

  const onSubmit = async (values: AddManagerSchemaType) => {
    if (initialManagerId) {
      startTransition(() => {
        editManagerAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message, {
            richColors: true,
          });
          form.reset({
            serviceId: undefined,
            serviceManagerId: undefined,
          });
          setOpen(false);
        });
      });
    } else {
      startTransition(() => {
        AddManagerAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message, {
            richColors: true,
          });
          form.reset({
            serviceId: undefined,
            serviceManagerId: undefined,
          });
          setOpen(false);
        });
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Manager to {serviceName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-select members */}
            <FormField
              control={form.control}
              name="serviceManagerId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem value={user.id} key={user.id}>
                            <div className="flex justify-between w-full">
                              {`${user.fullName} (${user.employeeId})`}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {initialManagerId ? "Change" : "Add"} Manager{" "}
                {isLoading ? <Loader className="animate-spin" /> : <Plus />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
