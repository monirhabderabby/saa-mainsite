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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

export const allowStatus = [
  { id: IssueStatus.open, name: "Open" },
  { id: IssueStatus.wip, name: "Work in progress" },
  {
    id: IssueStatus.done,
    name: "Done",
  },
  {
    id: IssueStatus.cancelled,
    name: "Cancelled",
  },
  {
    id: IssueStatus.dispute,
    name: "Dispute",
  },
];

interface Props {
  trigger: ReactNode;
  profiles: Profile[];
  teams: Team[];
  services: Services[];
  currentUserServiceId?: string;
  currentUserTeamId?: string;
}
export default function AddFilterIssueSheetEntries({
  trigger,
  profiles,
  teams,
  services,
  currentUserServiceId,
  currentUserTeamId,
}: Props) {
  const [open, setOpen] = useState(false);
  const { setAllValues, clearFilters } = useIssueSheetFilterState();

  const form = useForm<IssueSheetFilter>({
    resolver: zodResolver(issueSheetFilterSchema),
    defaultValues: {
      clientName: undefined,
      orderId: undefined,
      profileId: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      serviceId: currentUserServiceId ?? undefined,
      status: undefined,
      teamId: currentUserTeamId ?? undefined,
    },
  });

  function onSubmit(values: IssueSheetFilter) {
    setAllValues({
      ...values,
      createdFrom: values.createdFrom?.toISOString(),
      createdTo: values.createdTo?.toISOString(),
    });
    setOpen(false);
  }

  useEffect(() => {
    setAllValues({
      serviceId: currentUserServiceId,
      teamId: currentUserTeamId,
    });
  }, [currentUserServiceId, setAllValues]);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
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
                        value={field.value ?? ""}
                        placeholder="You can write client name ex: Ashanti, rafarraveria"
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
                        value={field.value ?? ""} // 👈 ensures always a string
                        placeholder="ex: FO321834E7607"
                      />
                    </FormControl>
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
                        onValueChange={field.onChange}
                        value={field.value}
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
                    <FormDescription></FormDescription>
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""} // 👈 cast so TS is happy
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {allowStatus.map((item) => (
                          <SelectItem value={item.id} key={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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
                        onValueChange={field.onChange}
                        value={field.value}
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
                    <FormDescription></FormDescription>
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
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profile" />
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
                    <FormDescription></FormDescription>
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
                      value={field.value} // 👈 force controlled, placeholder shows
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
                      value={field.value} // 👈 same fix
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  clearFilters();

                  form.reset({
                    clientName: "",
                    orderId: "",
                    profileId: "",
                    teamId: "",
                    serviceId: "",
                    createdFrom: undefined,
                    createdTo: undefined,
                    status: "",
                  });
                }}
                type="button"
              >
                <Repeat /> Reset
              </Button>
              <Button
                variant="outline"
                className="text-primary hover:text-primary/80"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
                type="button"
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
