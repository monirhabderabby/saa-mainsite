"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { assignResponsibilityAction } from "@/actions/teams/responsibility";
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
  ResponsibilitySchemaType,
  responsibilityZodSchema,
} from "@/schemas/team";
import { TeamResponsibility } from "@prisma/client";
import { Loader, Plus, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AddMemberModalProps {
  teamId: string;
  teamName: string;
  userId: string;
  trigger?: React.ReactNode;
  responsibility: TeamResponsibility;
}

const responsibilityLabels: Record<TeamResponsibility, string> = {
  [TeamResponsibility.Leader]: "Team Leader",
  [TeamResponsibility.Coleader]: "Co-Leader",
  [TeamResponsibility.Member]: "Team Member",
};

export default function AddResponsibilityModal({
  teamId,
  teamName,
  trigger,
  userId,
  responsibility,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const form = useForm<ResponsibilitySchemaType>({
    resolver: zodResolver(responsibilityZodSchema),
    defaultValues: {
      teamId,
      responsibility: responsibility ?? "",
      userId,
    },
  });

  const onSubmit = async (values: ResponsibilitySchemaType) => {
    startTransition(() => {
      assignResponsibilityAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        form.reset();
        setOpen(false);
      });
    });
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
            <Shield className="w-5 h-5" /> Assign Responsibility in {teamName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-select members */}
            <FormField
              control={form.control}
              name="responsibility"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Select Members
                  </FormLabel> */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a responsibility level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TeamResponsibility).map((res) => (
                        <SelectItem value={res} key={res}>
                          {responsibilityLabels[res]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Responsibility
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
