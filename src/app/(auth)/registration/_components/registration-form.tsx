"use client";
import { registerAction } from "@/actions/auth/registration";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import * as ResizablePanel from "@/components/ui/resizable-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registrationSchema,
  RegistrationSchemaValues,
} from "@/schemas/auth/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Designations, Role } from "@prisma/client";
import { Loader2, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const allowedRegistrationRoles = [
  { id: Role.OPERATION_MEMBER, name: "Operation" },
  { id: Role.SALES_MEMBER, name: "Sales" },
  { id: Role.ADMIN, name: "Admin" }, // 👈 add this
];

interface Props {
  services: { id: string; name: string }[];
  designations: Designations[];
}

export default function RegistrationForm({ services, designations }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"form" | "success">("form");
  const [pending, startTransition] = useTransition();
  const form = useForm<RegistrationSchemaValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      serviceId: "",
    },
  });

  function onSubmit(values: RegistrationSchemaValues) {
    startTransition(() => {
      registerAction(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        form.reset({
          fullName: "",
          password: "",
          employeeId: "",
          serviceId: "",
        });

        setEmail(res.user?.email as string);

        setState("success");
      });
    });
  }

  const selectedServiceId = form.watch("serviceId");

  const filteredDesignations =
    designations.filter((d) => d.serviceId === selectedServiceId) || undefined;

  // 👇 decide which roles to show
  const filteredRoles =
    services.find((s) => s.id === selectedServiceId)?.name === "Management"
      ? allowedRegistrationRoles.filter((r) => r.id === Role.ADMIN)
      : allowedRegistrationRoles.filter(
          (r) => r.id === Role.SALES_MEMBER || r.id === Role.OPERATION_MEMBER
        ) || undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/black-logo.svg"
            width={180}
            height={57}
            alt="black logo"
          />
          <CardTitle>Welcome Back</CardTitle>
        </div>
      </CardHeader>
      <ResizablePanel.Root value={state}>
        <ResizablePanel.Content value="form">
          <CardContent className="w-full md:w-fit">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 max-w-[600px] mx-auto pb-10"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              type="text"
                              {...field}
                              disabled={pending}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            type="email"
                            {...field}
                            disabled={pending}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Line</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((item) => (
                                <SelectItem value={item.id} key={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder=""
                          {...field}
                          disabled={pending}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            type=""
                            {...field}
                            disabled={pending}
                          />
                        </FormControl>
                        <FormDescription>
                          Collect this from HR for verification and records
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredRoles.map((item) => (
                                <SelectItem value={item.id} key={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredDesignations.map((item) => (
                                <SelectItem value={item.id} key={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Select a service line first to see the available
                          designations.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  Create Account{" "}
                  {pending && <Loader2 className="animate-spin" />}
                </Button>
              </form>
            </Form>
            <div className="text-center text-sm ">
              <span className="text-gray-600">Already have an account?</span>{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Log in here
              </Link>
            </div>

            {/* Back to home */}
            <div className="w-full flex justify-center mt-3">
              <Link
                href="/"
                className="flex items-center gap-x-2 text-[14px] group"
              >
                <MoveLeft />
                <span className="group-hover:underline">Back to home</span>
              </Link>
            </div>
          </CardContent>
        </ResizablePanel.Content>
        <ResizablePanel.Content value="success">
          <CardContent className="pb-0 px-0 min-w-[400px]">
            <CardHeader>
              <CardTitle className="text-center">Check your email</CardTitle>
              <CardDescription className="text-center pt-3">
                We emailed a magic link to <br />
                <span className="font-bold">{email}</span>
              </CardDescription>
            </CardHeader>
          </CardContent>
        </ResizablePanel.Content>
      </ResizablePanel.Root>
    </Card>
  );
}
