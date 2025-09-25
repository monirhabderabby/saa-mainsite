"use client";
import { createService } from "@/actions/services/create";
import { editService } from "@/actions/services/edit";
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
import { SerivceSchemaType, serviceSchema } from "@/schemas/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Services } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  initialData?: Services;
  departmentId: string;
}
export default function AddServiceDialog({
  trigger,
  initialData,
  departmentId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<SerivceSchemaType>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      departmentId: departmentId,
    },
  });

  function onSubmit(values: SerivceSchemaType) {
    console.log(values);
    startTransition(() => {
      if (initialData) {
        editService(initialData.id, values).then((res) => {
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
        });
      } else {
        createService(values).then((res) => {
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
                  <FormLabel>Service Name</FormLabel>
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
                      ? "Edit a service name"
                      : "Write a service name"}
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
