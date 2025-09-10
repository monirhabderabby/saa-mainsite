"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AccountStatus, User } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

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
  const [pendingValue, setPendingValue] = useState<AccountStatus | null>(null);

  const handleChange = (value: AccountStatus) => {
    setPendingValue(value);
    setIsModalOpen(true); // open confirmation modal
  };

  const handleConfirm = () => {
    if (pendingValue) {
      // update the form value and submit
      form.setValue("accountStatus", pendingValue);
      form.handleSubmit(onSubmit)();
      setPendingValue(null);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setPendingValue(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: UserStatusSchemaType) => {
    console.log("Status updated:", values);
    // call your API to update user status here
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
                <Select value={field.value} onValueChange={handleChange}>
                  <SelectTrigger className="w-[200px] shadow-none">
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
        loading={false}
        title="Confirm Status Change"
        message={`Are you sure you want to change status to "${pendingValue}"?`}
      />
    </>
  );
};

export default AccountStatusForm;
