"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserFilterStore } from "@/zustand/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountStatus } from "@prisma/client";
import { Repeat } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const employeeFilterSchema = z.object({
  serviceId: z.string().optional(),
  departmentId: z.string().optional(),
  accountStatus: z.string().optional(),
  searchQuery: z.string().optional(),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;

interface Props {
  trigger: ReactNode;
  services: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export default function AddUserFilterModal({
  trigger,
  services,
  departments,
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    serviceId,
    setServiceId,
    departmentId,
    setDepartmentId,
    accountStatus,
    setAccountStatus,
    searchQuery,
    setSearchQuery,
  } = useUserFilterStore();

  const form = useForm<EmployeeFilter>({
    resolver: zodResolver(employeeFilterSchema),
    defaultValues: {
      serviceId: serviceId ?? "All",
      departmentId: departmentId ?? "All",
      accountStatus: accountStatus ?? "All",
      searchQuery: searchQuery ?? "",
    },
  });

  function onSubmit(values: EmployeeFilter) {
    setServiceId(values.serviceId ?? "All");
    setDepartmentId(values.departmentId ?? "All");
    setAccountStatus((values.accountStatus as AccountStatus) ?? "All");
    setSearchQuery(values.searchQuery ?? "");
    setOpen(false);
  }

  useEffect(() => {
    form.reset({
      serviceId,
      departmentId,
      accountStatus,
      searchQuery,
    });
  }, [serviceId, departmentId, accountStatus, searchQuery, form]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Employee Filters</AlertDialogTitle>
          <AlertDialogDescription>
            Use these filters to narrow down employees. You can filter by
            service line, department, account status, or search by ID, name, or
            email.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Service */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? "All"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? "All"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
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

            {/* Account Status */}
            <FormField
              control={form.control}
              name="accountStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "All"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Account Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {Object.keys(AccountStatus).map((status) => (
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

            {/* Search */}
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter Employee ID, Name, or Email..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    serviceId: "All",
                    departmentId: "All",
                    accountStatus: "All",
                    searchQuery: "",
                  });
                }}
              >
                <Repeat /> Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-primary hover:text-primary/80"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
