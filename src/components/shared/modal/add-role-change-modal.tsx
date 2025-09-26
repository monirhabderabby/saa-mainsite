"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { changeAccountRole } from "@/actions/user/role-change";
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
import { useUserFilterStore } from "@/zustand/users";
import { Role } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, Shield, UserCog } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

// ✅ Schema for role change
const roleChangeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  updatedRole: z.nativeEnum(Role, {
    message: "Please select a role",
  }),
});

type RoleChangeSchemaType = z.infer<typeof roleChangeSchema>;

// ✅ Label mapping for roles
export const roleLabels: Record<Role, string> = {
  [Role.OPERATION_MEMBER]: "Operation",
  [Role.SALES_MEMBER]: "Sales",
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Admin",
};

interface RoleChangeModalProps {
  userId: string;
  userName: string;
  currentRole: Role;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function AddRoleChangeModal({
  userId,
  userName,
  currentRole,
  trigger,
  onClose,
}: RoleChangeModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  // Get current filters from Zustand
  const {
    page,
    searchQuery,
    serviceId,
    accountStatus,
    role,
    departmentId,
    teamId,
  } = useUserFilterStore();

  const queryClient = useQueryClient(); // 👈 create queryClient instance

  const form = useForm<RoleChangeSchemaType>({
    resolver: zodResolver(roleChangeSchema),
    defaultValues: {
      userId,
      updatedRole: currentRole,
    },
  });

  const onSubmit = async (values: RoleChangeSchemaType) => {
    startTransition(() => {
      changeAccountRole(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        form.reset({ userId, updatedRole: values.updatedRole });
        setOpen(false);
        onClose?.();
        // 👇 revalidate table query
        // ✅ Revalidate ONLY the current query with filters
        queryClient.invalidateQueries({
          queryKey: [
            "users",
            page ?? "",
            searchQuery ?? "",
            serviceId ?? "",
            accountStatus ?? "All",
            role ?? "",
            departmentId ?? "",
            teamId ?? "",
          ],
          exact: true,
        });
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserCog className="w-4 h-4 mr-2" />
            Change Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Role for {userName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selection */}
            <FormField
              control={form.control}
              name="updatedRole"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Role).map((role) => (
                        <SelectItem value={role} key={role}>
                          {roleLabels[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Hidden userId */}
            <input type="hidden" {...form.register("userId")} />

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
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <UserCog className="w-4 h-4 mr-2" />
                    Update Role
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
