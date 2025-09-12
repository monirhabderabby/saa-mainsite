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
import {
  updateSheetFilter,
  UpdateSheetFilter,
} from "@/schemas/update-sheet/filter";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile } from "@prisma/client";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

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
    setAllValues(values);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 s">
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
                          <SelectItem value="all">All</SelectItem>
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
