"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { forgetPasswordAction } from "@/actions/auth/forget-password";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  forgetPasswordSchema,
  ForgetPasswordType,
} from "@/schemas/auth/password-reset";
import { toast } from "sonner";

interface Props {
  onSuccess: (email: string) => void;
}

export default function ForgetPasswordForm({ onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  // Initialize the form
  const form = useForm<ForgetPasswordType>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: ForgetPasswordType) {
    startTransition(() => {
      forgetPasswordAction(data).then((res) => {
        if (!res.success) {
          toast.error(res.message);

          return;
        }

        // handle success
        toast.success(res.message);
        onSuccess(data.email);
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Enter your email address"
                    type="email"
                    disabled={pending}
                    startIcon={Mail}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <Button type="submit" className="w-full " disabled={pending}>
          {pending ? "Please wait..." : "Get Reset Link"}
        </Button>
      </form>
    </Form>
  );
}
