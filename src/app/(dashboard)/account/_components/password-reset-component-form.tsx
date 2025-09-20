"use client";
import { customPasswordResetAction } from "@/actions/auth/custom-password-reset";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import {
  customPasswordResetSchema,
  CustomPasswordResetSchemaType,
} from "@/schemas/auth/password-reset";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  onCLose: () => void;
}

export default function PasswordResetComponentForm({ onCLose }: Props) {
  const [pending, startTransition] = useTransition();
  const form = useForm<CustomPasswordResetSchemaType>({
    resolver: zodResolver(customPasswordResetSchema),
  });

  function onSubmit(values: CustomPasswordResetSchemaType) {
    startTransition(() => {
      customPasswordResetAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        onCLose();
      });
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8  border-t-[1px] border-input py-10"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Current Password"
                  {...field}
                  className="h-[40px]"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="New Password"
                      {...field}
                      className="h-[40px]"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new Passowrd</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm New Password"
                      {...field}
                      className="h-[40px]"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            Change Now {pending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
