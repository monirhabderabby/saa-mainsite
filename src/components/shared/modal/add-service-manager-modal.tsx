"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AddManagerAction } from "@/actions/services/add-manager";
import { editManagerAction } from "@/actions/services/edit-manager";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addManagerSchema, AddManagerSchemaType } from "@/schemas/services";
import { Prisma } from "@prisma/client";
import Fuse from "fuse.js";
import { Check, ChevronsUpDown, Loader, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

type UserTypes = Prisma.UserGetPayload<{
  select: {
    id: true;
    fullName: true;
    employeeId: true;
  };
}>;

interface AddMemberModalProps {
  serviceId: string;
  serviceName: string;
  users: UserTypes[]; // from backend
  trigger?: React.ReactNode;
  initialManagerId?: string;
}

export default function AddServiceManagerModal({
  serviceId,
  serviceName,
  users,
  trigger,
  initialManagerId,
}: AddMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [query, setQuery] = React.useState("");

  // Initialize Fuse
  const fuse = new Fuse(users, {
    keys: ["fullName", "employeeId"],
    threshold: 0.3, // adjust: lower = stricter, higher = more fuzzy
  });

  // Get filtered users
  const filteredUsers = query
    ? fuse.search(query).map((res) => res.item)
    : users;

  const form = useForm<AddManagerSchemaType>({
    resolver: zodResolver(addManagerSchema),
    defaultValues: {
      serviceId,
      serviceManagerId: initialManagerId ?? "",
    },
  });

  const onSubmit = async (values: AddManagerSchemaType) => {
    if (initialManagerId) {
      startTransition(() => {
        editManagerAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message, {
            richColors: true,
          });
          form.reset({
            serviceId: undefined,
            serviceManagerId: undefined,
          });
          setOpen(false);
        });
      });
    } else {
      startTransition(() => {
        AddManagerAction(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          // handle success
          toast.success(res.message, {
            richColors: true,
          });
          form.reset({
            serviceId: undefined,
            serviceManagerId: undefined,
          });
          setOpen(false);
        });
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Manager to {serviceName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Multi-select members */}
            <FormField
              control={form.control}
              name="serviceManagerId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {field.value
                              ? (() => {
                                  const selected = users.find(
                                    (u) => u.id === field.value
                                  );
                                  return selected
                                    ? `${selected.fullName} (${selected.employeeId})`
                                    : "Select a manager";
                                })()
                              : "Select a manager"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Type employee id..."
                              onInput={(e) =>
                                setQuery((e.target as HTMLInputElement).value)
                              }
                            />
                            <CommandList
                              className="max-h-60 overflow-y-auto"
                              onWheel={(e) => e.stopPropagation()}
                              style={{ WebkitOverflowScrolling: "touch" }}
                            >
                              {filteredUsers.length === 0 && (
                                <CommandEmpty>No manager found.</CommandEmpty>
                              )}
                              <CommandGroup>
                                {filteredUsers.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={user.employeeId}
                                    onSelect={() => field.onChange(user.id)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        user.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {user.fullName} ({user.employeeId})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {initialManagerId ? "Change" : "Add"} Manager{" "}
                {isLoading ? <Loader className="animate-spin" /> : <Plus />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
