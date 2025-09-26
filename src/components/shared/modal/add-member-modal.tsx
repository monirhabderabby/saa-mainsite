"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { addMemberToteamAction } from "@/actions/teams/create";
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
import { MultiSelect } from "@/components/ui/multi-select"; // <-- assume you have a multi-select component
import { addMemberSchema, AddMemberSchema } from "@/schemas/team";
import { User } from "@prisma/client";
import { Loader, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AddMemberModalProps {
  teamId: string;
  teamName: string;
  users: User[]; // from backend
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function AddMemberModal({
  teamId,
  teamName,
  users,
  trigger,
  onClose,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const form = useForm<AddMemberSchema>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      teamId,
      members: [],
    },
  });

  const onSubmit = async (values: AddMemberSchema) => {
    startTransition(() => {
      addMemberToteamAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        form.reset({
          teamId: "",
          members: [],
        });
        setOpen(false);
        onClose?.();
      });
    });
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
            <UserPlus className="w-5 h-5" /> Add Member to {teamName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-select members */}
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Select Members
                  </FormLabel> */}
                  <FormControl>
                    <MultiSelect
                      options={users.map((u) => ({
                        label: `${u.fullName} (${u.employeeId})`,
                        value: u.id,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choose team members"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden teamId */}
            <input type="hidden" {...form.register("teamId")} />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Add Member{" "}
                {isLoading ? <Loader className="animate-spin" /> : <Plus />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
