"use client";
const RichTextEditor = dynamic(
  () => import("@/components/shared/rich-text-editor/rich-text-editor"),
  {
    ssr: false,
  }
);
import { createUpdateSheetEntries } from "@/actions/update-sheet/create";
import { deleteUpdateSheetEntry } from "@/actions/update-sheet/delete";
import { updateUpdateSheetEntry } from "@/actions/update-sheet/update";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import AlertModal from "@/components/ui/custom/alert-modal";
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
import { cn, getTextFromHtml } from "@/lib/utils";
import {
  restrictedWords,
  UpdateSheetCreateSchema,
  updateSheetCreateSchema,
} from "@/schemas/update-sheet/create";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma, Profile, UpdateTo } from "@prisma/client";
import { Check, ChevronsUpDown, Loader2, Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type initialDataType = Prisma.UpdateSheetGetPayload<{
  select: {
    id: true;
    updateById: true;
    profileId: true;
    clientName: true;
    orderId: true;
    attachments: true;
    commentFromOperation: true;
    commentFromSales: true;
    updateTo: true;
    message: true;
    updateBy: {
      select: {
        service: {
          select: {
            id: true;
            serviceManagerId: true;
          };
        };
        userTeams: {
          select: {
            teamId: true;
          };
        };
      };
    };
  };
}>;
interface Props {
  profiles: Profile[];
  initialData?: initialDataType;
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

export default function AddUpdateForm({ profiles, initialData }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateSheetCreateSchema>({
    resolver: zodResolver(updateSheetCreateSchema),
    defaultValues: {
      profileId: initialData?.profileId ?? undefined,
      clientName: initialData?.clientName ?? undefined,
      orderId: initialData?.orderId ?? undefined,
      attachments: initialData?.attachments ?? undefined,
      commentFromOperation: initialData?.commentFromOperation ?? undefined,
      commentFromSales: initialData?.commentFromSales ?? undefined,
      updateTo: initialData?.updateTo ?? undefined,
      message: initialData?.message ?? undefined,
    },
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
    if (initialData) {
      startTransition(() => {
        updateUpdateSheetEntry(initialData.id, values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          router.back();
          return;
        });
      });
    } else {
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
          router.refresh();

          toast.success(res.message);
        });
      });
    }
  }

  function handleDelete() {
    if (!initialData) return;
    startTransition(async () => {
      const res = await deleteUpdateSheetEntry(initialData.id);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.back();
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5  ">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 pt-2">
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
                                    field.onChange(p.id); // 👈 still store id
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  key={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={colorMap[field.value] ?? ""}>
                      <SelectValue placeholder="Where message should to go?" />
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
                  value={field.value}
                  onChange={field.onChange}
                  restrictedWords={restrictedWords}
                  maxChars={2500}
                />

                <FormMessage />
              </FormItem>
            )}
          />

          {restrictedFound.length > 0 && (
            <div className="text-red-500 text-sm mt-2">
              ⚠️ Warning: Your message contains restricted words:{" "}
              <strong>{restrictedFound.join(", ")}</strong>
            </div>
          )}
          <div className="w-full flex justify-end gap-5">
            {initialData && (
              <Button
                variant="destructive"
                onClick={() => setDeleteModalOpen((p) => !p)}
                type="button"
                disabled={pending}
              >
                <Trash />
                Delete
              </Button>
            )}
            <Button
              type="submit"
              disabled={pending || restrictedFound.length > 0}
            >
              {initialData ? "Save Now" : "Submit"}{" "}
              {pending && <Loader2 className="animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete} // your delete handler
        loading={pending}
        title="Are you sure you want to delete this message?"
        message="This action cannot be undone. The update entry will be permanently removed."
      />
    </>
  );
}
