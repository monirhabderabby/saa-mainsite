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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFsdProjectFilterState } from "@/zustand/tools/fsd-project";
import { Profile, ProjectStatus, Team } from "@prisma/client";
import { Repeat } from "lucide-react";
import dynamic from "next/dynamic";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

const SmartDatePicker = dynamic(
  () => import("@/components/ui/custom/smart-date-picker"),
  { ssr: false },
);

const projectStatusOptions = [
  { value: "NRA", label: "NRA" },
  { value: "WIP", label: "WIP" },
  { value: "Delivered", label: "Delivered" },
  { value: "Revision", label: "Revision" },
  { value: "Cancelled", label: "Cancelled" },
];

interface FsdProjectFilterForm {
  orderId?: string;
  clientName?: string;
  profileId?: string;
  teamId?: string[];
  shift?: string;
  status?: ProjectStatus[];
  review?: number;

  deadlineFrom?: Date;
  deadlineTo?: Date;

  lastUpdateFrom?: Date;
  lastUpdateTo?: Date;

  nextUpdateFrom?: Date;
  nextUpdateTo?: Date;
}

interface Props {
  trigger: ReactNode;
  profiles: Profile[];
  teams: Team[];
}

export default function AddFilterFsdProject({
  trigger,
  profiles,
  teams,
}: Props) {
  const [open, setOpen] = useState(false);
  const { setAllValues, clearFilters } = useFsdProjectFilterState();

  const teamsOptions = teams.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const form = useForm<FsdProjectFilterForm>({
    defaultValues: {},
  });

  function onSubmit(values: FsdProjectFilterForm) {
    setAllValues({
      ...values,
      deadlineFrom: values.deadlineFrom?.toISOString(),
      deadlineTo: values.deadlineTo?.toISOString(),
      lastUpdateFrom: values.lastUpdateFrom?.toISOString(),
      lastUpdateTo: values.lastUpdateTo?.toISOString(),
      nextUpdateFrom: values.nextUpdateFrom?.toISOString(),
      nextUpdateTo: values.nextUpdateTo?.toISOString(),
    });

    setOpen(false);
  }

  const resetForm = () => {
    form.reset({
      clientName: "",
      orderId: "",
      profileId: "",
      teamId: [],
      shift: "",
      status: [],
      review: 0,
      deadlineFrom: undefined,
      deadlineTo: undefined,
      lastUpdateTo: undefined,
      nextUpdateTo: undefined,
    });
    clearFilters();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Project Filters</AlertDialogTitle>
          <AlertDialogDescription>
            Filter projects by client, order, status, team, dates, and updates.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Client & Order */}
            <div className="grid grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="eg: gelinavibez"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="eg: FO41AFD63FB84"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>

                    <MultiSelect
                      options={teamsOptions}
                      value={field.value ?? []}
                      onValueChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Profile & Team */}
            <div className="grid grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="All">All</SelectItem>
                          {profiles.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <MultiSelect
                      options={projectStatusOptions}
                      value={field.value ?? []}
                      onValueChange={field.onChange}
                      placeholder="Select Statuses"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* last update next update */}
            <div className="grid grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="lastUpdateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Update</FormLabel>
                    <SmartDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextUpdateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Update</FormLabel>
                    <SmartDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="deadlineFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline From</FormLabel>
                    <SmartDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadlineTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline To</FormLabel>
                    <SmartDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                }}
              >
                <Repeat /> Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
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
