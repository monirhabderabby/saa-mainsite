"use client";

import { createComplaintAction } from "@/actions/complaint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  complaintPriorities,
  complaintSchema,
  ComplaintSchemaType,
  complaintSources,
} from "@/schemas/complaint";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateComplaintForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ComplaintSchemaType>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      subject: "",
      message: "",
      source: undefined,
      priority: undefined,
      supportingDocs: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "supportingDocs",
  });

  function onSubmit(values: ComplaintSchemaType) {
    startTransition(() => {
      createComplaintAction(values).then((res) => {
        if (res.success) {
          toast.success(res.message);
          form.reset();
          router.push("/complains");
        } else {
          toast.error(res.message);
        }
      });
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side: Form */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Complain Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive subject" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {complaintSources.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {complaintPriorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0) + p.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your complaint in detail..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-semibold">Supporting Documentation</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="flex items-center gap-1.5 h-9"
                >
                  <Plus className="h-3.5 w-3.5" /> Add URL
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`supportingDocs.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="https://example.com/doc" {...field} className="h-11" />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending} className="w-full md:w-auto px-8 h-11 bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Complaint
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Right side: Guidelines */}
      <div className="lg:col-span-1">
        <Card className="bg-muted/30 border-dashed sticky top-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Submission Guidelines</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">1</span>
                <span>Be clear and concise with your subject line. This helps us categorize your concern quickly.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">2</span>
                <span>Provide relevant sheet names (Issue/Update) if your complaint is regarding a specific record.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">3</span>
                <span>Include links to any documents or screenshots that support your claim for faster resolution.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">4</span>
                <span>Management will review all submissions within 72 hours and provide feedback via the portal.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">5</span>
                <span>Professionalism is expected. Objective and factual reporting leads to better outcomes.</span>
              </li>
            </ul>

            <div className="mt-8 p-4 bg-customYellow-primary/10 rounded-lg border border-customYellow-primary/20">
              <p className="text-[12px] text-orange-700 dark:text-customYellow-primary font-medium flex gap-2">
                <span className="font-bold">Note:</span>
                Need immediate assistance? Please contact your direct supervisor before submitting a formal complaint.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
