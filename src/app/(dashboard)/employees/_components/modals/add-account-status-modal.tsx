"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AccountStatus, User } from "@prisma/client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { statusUpdate } from "@/actions/user/update";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  userStatusSchema,
  UserStatusSchemaType,
} from "@/schemas/employees/table";
import { Loader, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: User;
  trigger?: React.ReactNode;
}

const AccountStatusModal = ({ data, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<UserStatusSchemaType>({
    resolver: zodResolver(userStatusSchema),
    defaultValues: {
      id: data.id,
      accountStatus: data.accountStatus,
    },
  });

  const onSubmit = (values: UserStatusSchemaType) => {
    console.log(values);
    startTransition(() => {
      statusUpdate(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        form.reset(values);
        setOpen(false);
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Change Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Change Account Status
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="accountStatus"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AccountStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountStatusModal;
