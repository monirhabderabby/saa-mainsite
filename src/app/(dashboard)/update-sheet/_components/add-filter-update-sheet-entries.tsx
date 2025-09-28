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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colorMap } from "@/components/ui/update-to-badge";
import { cn } from "@/lib/utils";
import {
  updateSheetFilter,
  UpdateSheetFilter,
} from "@/schemas/update-sheet/filter";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile, UpdateTo } from "@prisma/client";
import { Check, ChevronsUpDown, Repeat } from "lucide-react";
import dynamic from "next/dynamic";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
const SmartDatePicker = dynamic(
  () => import("@/components/ui/custom/smart-date-picker"),
  {
    ssr: false,
  }
);

export const allowUpdateTo = [
  { id: UpdateTo.ORDER_PAGE_UPDATE, name: "Order Page Update" },
  { id: UpdateTo.INBOX_PAGE_UPDATE, name: "Inbox Page Update" },
  {
    id: UpdateTo.INBOX_AND_ORDER_PAGE_UPDATE,
    name: "Inbox & Order Page Update",
  },
  {
    id: UpdateTo.DELIVERY,
    name: "Delivery",
  },
  {
    id: UpdateTo.UPWORK_INBOX,
    name: "Upwork Inbox",
  },
  {
    id: UpdateTo.REVIEW_RESPONSE,
    name: "Review Response",
  },
  {
    id: UpdateTo.FIVERR_SUPPORT_REPLY,
    name: "Fiverr Support Reply",
  },
];

interface Props {
  trigger: ReactNode;
  profiles: Profile[];
  currentUserServiceId?: string;
}
export default function AddFilterUpdateSheetEntries({
  trigger,
  profiles,
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    setAllValues,
    clearFilters,
    clientName,
    done,
    updateTo,
    orderId,
    profileId,
    tl,
    createdFrom,
    sendFrom,
  } = useUpdateSheetFilterState();

  const form = useForm<UpdateSheetFilter>({
    resolver: zodResolver(updateSheetFilter),
    defaultValues: {
      clientName: clientName ?? "",
      orderId: orderId ?? undefined,
      profileId: profileId ?? undefined,
      updateTo: updateTo ?? undefined,
      tl: tl ?? undefined,
      done: done ?? "notDone",
      createdFrom: createdFrom ? new Date(createdFrom) : undefined,
      sendFrom: sendFrom ? new Date(sendFrom) : undefined,
    },
  });

  function onSubmit(values: UpdateSheetFilter) {
    setAllValues({
      ...values,
      page: 1,
    });
    setOpen(false);
  }

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
                  <FormItem className="flex flex-col">
                    <FormLabel>Profile</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? profiles.find((p) => p.id === field.value)?.name
                              : "Select a profile"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full min-w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search profiles..." />
                          <CommandList>
                            <CommandEmpty>No profile found.</CommandEmpty>
                            <CommandGroup>
                              {profiles.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.name} // 👈 use name for search
                                  onSelect={() => {
                                    // Toggle selection: if already selected, deselect it
                                    if (field.value === p.id) {
                                      field.onChange(""); // Deselect by setting to empty string
                                    } else {
                                      field.onChange(p.id); // Select the new item
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === p.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {p.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="updateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined} // 👈 cast so TS is happy
                    >
                      <FormControl>
                        <SelectTrigger
                          className={colorMap[field.value as UpdateTo] ?? ""}
                        >
                          <SelectValue
                            defaultChecked
                            placeholder="Where message should to go?"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {allowUpdateTo.map((item) => (
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
                name="tl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TL Check</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by tl check" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="notTlCheck">No TL Check</SelectItem>
                        <SelectItem value="tlChecked">TL Checked</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="done"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Done?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by tl check" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="done">Sent ✅</SelectItem>
                        <SelectItem value="notDone">Waiting ⏳</SelectItem>
                      </SelectContent>
                    </Select>

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
                    <FormLabel>Created At</FormLabel>
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
                name="sendFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send At</FormLabel>
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
                    updateTo: "", // 👈 must be string, not undefined
                    tl: "",
                    done: "notDone",
                    createdFrom: undefined,
                    sendFrom: undefined,
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
