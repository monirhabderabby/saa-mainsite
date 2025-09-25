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
import { employeeFilterSchema, EmployeeFilterType } from "@/schemas/employees";
import { useUserFilterStore } from "@/zustand/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountStatus, Role, Services, Team } from "@prisma/client";
import { Repeat } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

const roleLabels: Record<Role, string> = {
  [Role.OPERATION_MEMBER]: "Operation",
  [Role.SALES_MEMBER]: "Sales",
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Admin",
};

interface Props {
  trigger: ReactNode;
  services: Services[];
  departments: { id: string; name: string }[];
  teams: Team[];
}

export default function AddUserFilterModal({
  trigger,
  services,
  departments,
  teams,
}: Props) {
  const [open, setOpen] = useState(false);

  const { setAllValues, resetFilters } = useUserFilterStore();

  const form = useForm<EmployeeFilterType>({
    resolver: zodResolver(employeeFilterSchema),
    defaultValues: {
      departmentId: undefined,
    },
  });

  const selectedDepartmentId = form.watch("departmentId");
  const selectedService = form.watch("serviceId");

  const filteredServices =
    selectedDepartmentId === "All"
      ? services
      : services.filter((item) => item.departmentId === selectedDepartmentId);

  const filteredTeams =
    selectedService === "All"
      ? teams
      : teams.filter((item) => item.serviceId === selectedService);

  function onSubmit(values: EmployeeFilterType) {
    setAllValues({
      ...values,
      accountStatus: (values.accountStatus ?? "") as AccountStatus | "",
    });

    setOpen(false);
  }

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
              {/* Search */}
              <div className="col-span-2">
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
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
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
                        value={field.value ?? ""}
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
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {filteredServices.map((s) => (
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

              {/* Teams */}
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {filteredTeams.map((s) => (
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
            </div>

            <div className="grid grid-cols-2 gap-5">
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

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Object.keys(Role).map((item) => (
                            <SelectItem key={item} value={item}>
                              {roleLabels[item as Role]}
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

            {/* Buttons */}
            <div className="flex justify-end gap-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    serviceId: "",
                    departmentId: "",
                    accountStatus: "",
                    searchQuery: "",
                    role: "",
                  });
                  resetFilters();
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
