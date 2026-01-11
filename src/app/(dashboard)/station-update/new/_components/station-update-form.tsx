"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile } from "@prisma/client";
import { ArrowLeft, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createStationUpdate } from "@/actions/station-update/create";
import { updateStationUpdate } from "@/actions/station-update/edit";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { stationForm, StationFormValues } from "@/schemas/station-update";
import { Prisma } from "@prisma/client";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

type StationUpdateWithRelations = Prisma.StationUpdateGetPayload<{
  include: {
    assignments: {
      include: {
        user: true;
        profiles: {
          include: {
            profile: true;
          };
        };
      };
    };
  };
}>;

interface Props {
  profiles: Profile[];
  users: { id: string; fullName: string }[];
  initialData?: StationUpdateWithRelations;
}

export default function CreateStationUpdateForm({
  profiles,
  users,
  initialData,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationForm),
    defaultValues: initialData
      ? {
          shift: initialData.shift,
          title: initialData.title,
          assignments: initialData.assignments.map((a) => ({
            userId: a.userId,
            profiles: a.profiles.map((p) => p.profile.id), // 👈 extract profile ids
          })),
        }
      : {
          shift: "",
          title: "",
          assignments: [{ userId: "", profiles: [""] }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  const onSubmit = (data: StationFormValues) => {
    if (initialData) {
      startTransition(() => {
        updateStationUpdate(initialData.id, data).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            console.log("updateError", res);
            return;
          }
          toast.success(res.message);
        });
      });
    } else {
      startTransition(() => {
        createStationUpdate(data).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            console.log("CreateError", res);
            return;
          }

          toast.success(res.message);
          form.reset();
          console.log(res);
        });
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        shift: initialData.shift,
        title: initialData.title,
        assignments: initialData.assignments.map((a) => ({
          userId: a.userId,
          profiles: a.profiles.map((p) => p.profile.id),
        })),
      });
    }
  }, [initialData, form]);

  return (
    <main className="flex-1">
      <div className="mb-0">
        <Link href="/station-update">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Updates
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {initialData ? "Edit" : "Create"} Station Update
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {initialData ? "Edit Your" : "Submit a new"} station update with
            profile assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning Shift</SelectItem>
                        <SelectItem value="day">Day Shift</SelectItem>
                        <SelectItem value="night">Night Shift</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dev Station Update"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Profile Assignments</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ userId: "", profiles: [""] })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Person
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex items-start gap-4">
                          <FormField
                            control={form.control}
                            name={`assignments.${index}.userId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Assigned Person</FormLabel>
                                <FormControl>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value
                                            ? users.find(
                                                (p) => p.id === field.value
                                              )?.fullName
                                            : "Select a person"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full min-w-[400px] p-0">
                                      <Command>
                                        <CommandInput placeholder="Search profiles..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            No User found.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {users.map((p) => (
                                              <CommandItem
                                                key={p.id}
                                                value={p.fullName} // 👈 use name for search
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
                                                {p.fullName}
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
                            )}
                          />

                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="mt-8 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm text-muted-foreground">
                              Assigned Profiles
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const profiles = form.getValues(
                                  `assignments.${index}.profiles`
                                );
                                form.setValue(`assignments.${index}.profiles`, [
                                  ...profiles,
                                  "",
                                ]);
                              }}
                              className="h-8 gap-1 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                              Add Profile
                            </Button>
                          </div>

                          {form
                            .watch(`assignments.${index}.profiles`)
                            .map((_, profileIndex) => (
                              <FormField
                                key={profileIndex}
                                control={form.control}
                                name={`assignments.${index}.profiles.${profileIndex}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-start gap-2">
                                      <FormControl>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                  "w-full justify-between",
                                                  !field.value &&
                                                    "text-muted-foreground"
                                                )}
                                              >
                                                {field.value
                                                  ? profiles.find(
                                                      (p) =>
                                                        p.id === field.value
                                                    )?.name
                                                  : "Select a profile"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-full min-w-[400px] p-0">
                                            <Command>
                                              <CommandInput placeholder="Search profiles..." />
                                              <CommandList>
                                                <CommandEmpty>
                                                  No profile found.
                                                </CommandEmpty>
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
                                      </FormControl>
                                      {form.watch(
                                        `assignments.${index}.profiles`
                                      ).length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const profiles = form.getValues(
                                              `assignments.${index}.profiles`
                                            );
                                            form.setValue(
                                              `assignments.${index}.profiles`,
                                              profiles.filter(
                                                (_, i) => i !== profileIndex
                                              )
                                            );
                                          }}
                                          className="h-10 w-10"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/station-update")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Submit Now
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
