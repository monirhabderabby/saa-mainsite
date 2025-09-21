"use client";

import { deleteDatabaseDataBasedonSchema } from "@/actions/settings/database-management";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  databaseManagementFormSchema,
  DatabaseManagementFormSchemaType,
} from "@/schemas/settings/database-management";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, FileText, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});

const collections = [
  {
    value: "updateSheet",
    label: "Update Sheet",
    icon: FileText,
  },
  {
    value: "issueSheet",
    label: "Issue Sheet",
    icon: AlertTriangle,
  },
];

const DatabaseManagementForm = () => {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<DatabaseManagementFormSchemaType>({
    resolver: zodResolver(databaseManagementFormSchema),
    defaultValues: {
      collection: undefined,
    },
  });

  // Store form values temporarily for confirmation modal
  const [formValues, setFormValues] =
    useState<DatabaseManagementFormSchemaType | null>(null);

  // Step 1: Handle form submit → open modal instead of executing logic immediately
  const handleSubmit = (values: DatabaseManagementFormSchemaType) => {
    setFormValues(values);
    setOpen(true);
  };

  // Step 2: Execute actual clearing when modal confirm
  const handleConfirm = () => {
    if (!formValues) return;

    startTransition(() => {
      deleteDatabaseDataBasedonSchema(formValues).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          setOpen(false);
          form.reset(); // optional: reset form after success
          return;
        }

        // handle success
        toast.success(res.message);
        setOpen(false);
        form.reset({
          collection: undefined,
        }); // optional: reset form after success
      });
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Collection */}
            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collections.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-x-2">
                            <Icon className="w-4 h-4" /> {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Clear Selected Data</p>
              <p className="text-sm text-muted-foreground">
                This will permanently delete data from the selected collection
                and date range
              </p>
            </div>
            <Button type="submit" variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </form>
      </Form>

      {/* Confirmation Modal */}
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        loading={pending}
        title="Confirm Data Deletion"
        message={
          formValues
            ? `Are you sure you want to permanently delete data from the "${formValues.collection}" collection between ${format(
                formValues.startDate,
                "PPP"
              )} and ${format(formValues.endDate, "PPP")}? This action cannot be undone.`
            : ""
        }
      />
    </>
  );
};

export default DatabaseManagementForm;
