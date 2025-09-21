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
import { MultiSelect } from "@/components/ui/multi-select";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  IssueSheetFilter,
  issueSheetFilterSchema,
} from "@/schemas/issue-sheet/filter";
import { useIssueSheetFilterState } from "@/zustand/issue-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { IssueStatus, Profile, Services, Team } from "@prisma/client";
import { Repeat } from "lucide-react";
import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
const SmartDatePicker = dynamic(
  () => import("@/components/ui/custom/smart-date-picker"),
  {
    ssr: false,
  }
);

// allowed statuses for UI (must match enum)
export const allowStatus = [
  { value: "open", label: "Open" },
  { value: "wip", label: "Wip" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
  { value: "dispute", label: "Dispute" },
];

interface Props {
  trigger: ReactNode;
  profiles: Profile[];
  teams: Team[];
  services: Services[];
  currentUserServiceId?: string | null;
  currentUserTeamId?: string | null;
}
export default function AddFilterIssueSheetEntries({
  trigger,
  profiles,
  teams,
  services,
  currentUserServiceId = null,
  currentUserTeamId = null,
}: Props) {
  const [open, setOpen] = useState(false);

  // zustand state
  const {
    setAllValues,
    clearFilters,
    status: storeStatus,
    teamId,
    serviceId,
  } = useIssueSheetFilterState();

  const allowedStatus: IssueStatus[] = [
    "open",
    "wip",
    "done",
    "cancelled",
    "dispute",
  ];

  const form = useForm<IssueSheetFilter>({
    resolver: zodResolver(issueSheetFilterSchema),
    defaultValues: {
      clientName: "",
      orderId: "",
      profileId: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      serviceId: serviceId ?? undefined,
      status: storeStatus?.filter((s): s is IssueStatus =>
        allowedStatus.includes(s as IssueStatus)
      ) ?? ["open", "wip"],
      teamId: teamId ?? undefined,
    },
  });

  // prevent double submits
  const { handleSubmit, reset, formState } = form;

  const onSubmit = (values: IssueSheetFilter) => {
    console.log(values);
    setAllValues({
      ...values,
      createdFrom:
        values.createdFrom instanceof Date
          ? values.createdFrom.toISOString()
          : values.createdFrom,
      createdTo:
        values.createdTo instanceof Date
          ? values.createdTo.toISOString()
          : values.createdTo,
    });
    setOpen(false);
  };

  // Reset / Clear: clear store and form consistently
  function handleReset() {
    clearFilters({
      status: ["open", "wip"],
      serviceId: currentUserServiceId ?? null,
      teamId: currentUserTeamId ?? null,
    });
    reset({
      clientName: undefined,
      orderId: undefined,
      profileId: undefined,
      teamId: currentUserTeamId ?? undefined,
      serviceId: currentUserServiceId ?? undefined,
      createdFrom: undefined,
      createdTo: undefined,
      status: ["open", "wip"],
    });
  }

  useEffect(() => {
    setAllValues({
      clientName: "",
      orderId: "",
      profileId: undefined,
      serviceId: currentUserServiceId ?? null,
      status: ["open", "wip"],
      teamId: currentUserTeamId ?? null,
      createdFrom: undefined,
      createdTo: undefined,
    });
  }, [currentUserServiceId, currentUserTeamId, setAllValues]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Filters</AlertDialogTitle>
          <AlertDialogDescription>
            Use these filters to narrow down the update sheet entries. You can
            filter by profile, client, order ID, update type, TL check, status,
            and dates. Click &quot;Reset&quot; to clear all filters.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 ">
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        // keep UI friendly: show empty string if undefined
                        value={field.value ?? ""}
                        placeholder="You can write client name ex: Ashanti, rafarraveria"
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
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
                        placeholder="ex: FO321834E7607"
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profiles</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === "All" ? undefined : val)
                        }
                        value={field.value ?? undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profile" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            {profiles.map((p) => (
                              <SelectItem value={p.id} key={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={allowStatus}
                        value={field.value ?? []}
                        onValueChange={field.onChange}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service line</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === "All" ? undefined : val)
                        }
                        value={field.value ?? undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service line" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            {services.map((p) => (
                              <SelectItem value={p.id} key={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === "All" ? undefined : val)
                        }
                        value={field.value ?? undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            {teams.map((p) => (
                              <SelectItem value={p.id} key={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="createdFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created From</FormLabel>
                    <SmartDatePicker
                      value={
                        field.value instanceof Date
                          ? field.value
                          : field.value
                            ? new Date(field.value)
                            : undefined
                      }
                      onChange={field.onChange}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created To</FormLabel>
                    <SmartDatePicker
                      value={
                        field.value instanceof Date
                          ? field.value
                          : field.value
                            ? new Date(field.value)
                            : undefined
                      }
                      onChange={field.onChange}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-x-4">
              <Button variant="outline" onClick={handleReset} type="button">
                <Repeat /> Reset
              </Button>
              <Button
                variant="outline"
                className="text-primary hover:text-primary/80"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Applying..." : "Apply Filters"}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
