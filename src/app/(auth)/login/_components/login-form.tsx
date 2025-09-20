"use client";
import { loginAction } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, LoginSchemaValues } from "@/schemas/auth/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MoveLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginSchemaValues>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginSchemaValues) {
    startTransition(() => {
      loginAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/");
      });
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 max-w-3xl mx-auto py-5"
        >
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Id</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter employee id here..."
                    type="text"
                    className="h-[40px]"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Passowrd"
                      {...field}
                      className="h-[40px]"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button asChild variant="link" className="ml-auto">
                <Link href="/forget-password">Forgot Password?</Link>
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            Login Now {pending && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-gray-600">New to our platform?</span>{" "}
        <Link
          href="/registration"
          className="font-medium text-primary hover:underline"
        >
          Sign up here
        </Link>
      </div>

      <div className="w-full flex justify-center mt-3">
        <Link href="/" className="flex items-center gap-x-2 text-[14px] group">
          <MoveLeft />
          <span className="group-hover:underline">Back to home</span>
        </Link>
      </div>
    </>
  );
}
