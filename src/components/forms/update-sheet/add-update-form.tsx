"use client";
const RichTextEditor = dynamic(
  () => import("@/components/shared/rich-text-editor/rich-text-editor"),
  {
    ssr: false,
  }
);
import { createUpdateSheetEntries } from "@/actions/update-sheet/create";
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
import { getTextFromHtml } from "@/lib/utils";
import {
  restrictedWords,
  UpdateSheetCreateSchema,
  updateSheetCreateSchema,
} from "@/schemas/update-sheet/create";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile, UpdateTo } from "@prisma/client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  profiles: Profile[];
}

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

export default function AddUpdateForm({ profiles }: Props) {
  const [pending, startTransition] = useTransition();
  const form = useForm<UpdateSheetCreateSchema>({
    resolver: zodResolver(updateSheetCreateSchema),
    defaultValues: {},
  });

  const messageHtml = form.watch("message");

  // convert to plain text
  const messageText = useMemo(() => {
    return getTextFromHtml(messageHtml || "").toLowerCase();
  }, [messageHtml]);

  // check restricted words
  const restrictedFound = useMemo(() => {
    if (!messageText) return [];
    return restrictedWords.filter((word) =>
      messageText.includes(word.toLowerCase())
    );
  }, [messageText]);

  function onSubmit(values: UpdateSheetCreateSchema) {
    startTransition(() => {
      createUpdateSheetEntries(values).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // handle success
        form.reset({
          profileId: "",
          clientName: "",
          orderId: "",
          attachments: "",
          commentFromOperation: "",
          commentFromSales: "",
          updateTo: undefined,
          message: "",
        });

        toast.success(res.message);
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5  pb-10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
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
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Id</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <Input placeholder="" type="" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="commentFromOperation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment from Operation</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="commentFromSales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment from Sales</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="updateTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <RichTextEditor
                value={form.watch("message")}
                onChange={field.onChange}
                restrictedWords={restrictedWords}
                maxChars={2500}
              />
            </FormItem>
          )}
        />

        {restrictedFound.length > 0 && (
          <div className="text-red-500 text-sm mt-2">
            ⚠️ Warning: Your message contains restricted words:{" "}
            <strong>{restrictedFound.join(", ")}</strong>
          </div>
        )}
        <div className="w-full flex justify-end">
          <Button
            type="submit"
            disabled={pending || restrictedFound.length > 0}
          >
            Submit {pending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
