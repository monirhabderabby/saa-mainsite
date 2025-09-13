"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AccountStatus, User } from "@prisma/client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { statusUpdate } from "@/actions/user/update";
import AlertModal from "@/components/ui/custom/alert-modal";
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
import { toast } from "sonner";

interface Props {
  data: User;
}

const AccountStatusForm = ({ data }: Props) => {
  const form = useForm<UserStatusSchemaType>({
    resolver: zodResolver(userStatusSchema),
    defaultValues: {
      id: data.id,
      accountStatus: data.accountStatus,
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pendingValue, setPendingValue] = useState<AccountStatus | null>(null);

  const handleConfirm = () => {
    if (!pendingValue) return;

    startTransition(() => {
      statusUpdate({ id: data.id, accountStatus: pendingValue }).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // Success: update the form value
        form.setValue("accountStatus", pendingValue);

        toast.success(res.message);
        setIsModalOpen(false);
        setPendingValue(null);
      });
    });
  };

  const handleCancel = () => {
    setPendingValue(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <FormField
          control={form.control}
          name="accountStatus"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    setPendingValue(value as AccountStatus); // store for confirmation
                    setIsModalOpen(true);
                  }}
                >
                  <SelectTrigger className="w-fit shadow-none">
                    <SelectValue
                      placeholder="Select account status"
                      className="shadow-none"
                    />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>

      <AlertModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onClose={handleCancel}
        loading={pending}
        title="Confirm Status Change"
        message={`Are you sure you want to change status to "${pendingValue}"?`}
      />
    </>
  );
};

export default AccountStatusForm;
