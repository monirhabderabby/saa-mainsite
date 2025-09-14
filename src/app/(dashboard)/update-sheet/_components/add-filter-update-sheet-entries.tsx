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
import { colorMap } from "@/components/ui/update-to-badge";
import {
  updateSheetFilter,
  UpdateSheetFilter,
} from "@/schemas/update-sheet/filter";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile, UpdateTo } from "@prisma/client";
import { Repeat } from "lucide-react";
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
}
export default function AddFilterUpdateSheetEntries({
  trigger,
  profiles,
}: Props) {
  const [open, setOpen] = useState(false);
  const { setAllValues, clearFilters } = useUpdateSheetFilterState();

  const form = useForm<UpdateSheetFilter>({
    resolver: zodResolver(updateSheetFilter),
    defaultValues: {
      clientName: undefined,
      orderId: undefined,
      profileId: undefined,
      updateTo: undefined,
      tl: undefined,
      done: undefined,
      createdFrom: undefined,
      sendFrom: undefined,
    },
  });

  function onSubmit(values: UpdateSheetFilter) {
    setAllValues({
      ...values,
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
                      <Input {...field} placeholder="ex: FO321834E7607" />
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
                        defaultValue={field.value}
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
                name="updateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={colorMap[field.value as UpdateTo] ?? ""}
                        >
                          <SelectValue placeholder="Where message should to go?" />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                      value={field.value}
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
                      value={field.value}
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

                  form.reset();
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
