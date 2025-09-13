"use client";
import {
  AlertDialog,
  AlertDialogContent,
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
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

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
  const { profileId, setAllValues } = useUpdateSheetFilterState();

  const form = useForm<UpdateSheetFilter>({
    resolver: zodResolver(updateSheetFilter),
    defaultValues: {
      profileId: profileId,
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 s">
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
            <div className="flex justify-end gap-x-4">
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
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
