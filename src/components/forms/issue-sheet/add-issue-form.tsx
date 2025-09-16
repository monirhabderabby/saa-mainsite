"use client";
import { createIssueAction } from "@/actions/issue-sheet/create";
import { editIssueAction } from "@/actions/issue-sheet/update";
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
import { issueSheetSchema, IssueSheetSchemaType } from "@/schemas/issue-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { IssueSheet, Profile, Services } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  profiles: Profile[];
  services: Services[];
  initianData?: IssueSheet;
}

export default function AddIssueForm({
  profiles,
  services,
  initianData,
}: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<IssueSheetSchemaType>({
    resolver: zodResolver(issueSheetSchema),
    defaultValues: {
      clientName: initianData?.clientName ?? "",
      orderId: initianData?.orderId ?? "",
      serviceId: initianData?.serviceId ?? "",
      profileId: initianData?.profileId ?? "",
      orderPageUrl: initianData?.orderPageUrl ?? "",
      inboxPageUrl: initianData?.inboxPageUrl ?? "",
      specialNotes: initianData?.specialNotes ?? "",
      noteForSales: initianData?.noteForSales ?? "",
    },
  });

  function onSubmit(values: IssueSheetSchemaType) {
    if (initianData) {
      startTransition(() => {
        editIssueAction(initianData.id, values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle successfull
          toast.success(res.message);
          router.back();
        });
      });
    } else {
      startTransition(() => {
        createIssueAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle successfull
          toast.success(res.message);
          form.reset();
        });
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8  mx-auto py-5"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Ashanti, thefreelancepm"
                      type=""
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Id</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: FO72EC86A2647" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="profileId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem value={p.id} key={p.id}>
                      {p.name}
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
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Line</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service line" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((item) => (
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

        <FormField
          control={form.control}
          name="orderPageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Page URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="paste google drive link"
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inboxPageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inbox Page URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Paste google drive link"
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Notes</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Scheduled meeting at 12 Sep, 2025 at 9:00 AM"
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noteForSales"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note for Sales</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Please arrange a meeting "
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileOrMeetingLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File/Meeting Link (If any)</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Paste google file url "
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex items-center justify-end">
          <Button type="submit" disabled={pending}>
            {initianData ? "Save Now" : "Add New Issue"}{" "}
            {pending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
