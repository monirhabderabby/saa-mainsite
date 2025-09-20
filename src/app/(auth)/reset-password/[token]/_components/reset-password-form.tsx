"use client";

import { resetPasswordAction } from "@/actions/auth/reset-password";
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
  resetPasswordSchema,
  resetPasswordSchemaType,
} from "@/schemas/auth/password-reset";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Validation schema with zod

interface Props {
  token: string;
}

const ResetNowForm = ({ token }: Props) => {
  const [pending, startTransition] = useTransition();

  const router = useRouter();
  const form = useForm<resetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token,
    },
  });

  const onSubmit = (values: resetPasswordSchemaType) => {
    startTransition(() => {
      resetPasswordAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/login");
      });
    });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-[24px]">
            {/* New Password Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        placeholder="Enter your new password"
                        className="h-[40px] w-full"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password Field */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        placeholder="Confirm your new password"
                        className="h-[40px]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-[24px] min-h-[40px]"
            disabled={pending}
          >
            {pending ? "Please wait..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetNowForm;
