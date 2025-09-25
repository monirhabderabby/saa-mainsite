"use client";
import { createProfile } from "@/actions/profiles/create";
import { editProfile } from "@/actions/profiles/edit";
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
import { Input } from "@/components/ui/input";
import { profileSchema, ProfileSchemaType } from "@/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  initialData?: Profile;
  onClose?: () => void;
}
export default function AddProfileDialog({
  trigger,
  initialData,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name ?? "",
    },
  });

  function onSubmit(values: ProfileSchemaType) {
    startTransition(() => {
      if (initialData) {
        editProfile(initialData.id, values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message);
          form.reset({
            name: "",
          });
          setOpen(false);
          onClose?.();
        });
      } else {
        createProfile(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message);
          form.reset({
            name: "",
          });
          setOpen(false);
          onClose?.();
        });
      }
    });
  }

  useEffect(() => {
    if (open && initialData) {
      form.reset({ name: initialData.name });
    }
  }, [open, initialData, form]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 s">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Name</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder=""
                      type="text"
                      {...field}
                      disabled={pending}
                    />
                  </FormControl>
                  <FormDescription>
                    {initialData
                      ? "Edit a profile name"
                      : "Write a profile name"}
                  </FormDescription>
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
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {initialData ? "Save Now" : "Create Now"}{" "}
                {pending && <Loader2 className="animate-spin" />}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
