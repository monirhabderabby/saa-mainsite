"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import SmartDatePicker from "@/components/ui/custom/smart-date-picker";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  projectCreateSchema,
  ProjectCreateSchemaType,
} from "@/schemas/tools/fsd-projects/project-create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma, Profile, Team } from "@prisma/client";
import Fuse from "fuse.js";
import {
  Building,
  Calendar,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Projector,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

type UserTypes = Prisma.UserGetPayload<{
  select: {
    id: true;
    fullName: true;
    employeeId: true;
  };
}>;

interface Props {
  profiles: Profile[];
  users: UserTypes[];
  onClose?: () => void;
  teams: Team[];
}
export default function AddProjectModal({ profiles, users, teams }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  // Initialize Fuse
  const fuse = new Fuse(users, {
    keys: ["fullName", "employeeId"],
    threshold: 0.3, // adjust: lower = stricter, higher = more fuzzy
  });

  // Get filtered users
  const filteredUsers = query
    ? fuse.search(query).map((res) => res.item)
    : users;

  const form = useForm<ProjectCreateSchemaType>({
    resolver: zodResolver(projectCreateSchema),
  });

  function onSubmit(values: ProjectCreateSchemaType) {
    startTransition(() => {
      console.log(values);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          effect="expandIcon"
          icon={Plus}
          iconPlacement="right"
        >
          New Project
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full flex flex-col h-full  pr-3">
        <SheetHeader>
          <SheetTitle>New Project</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-x-3 mt-5 col-span-2">
                  <Building className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Client Information</span>
                </div>
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="e.g: gelinavibez"
                          type="text"
                          {...field}
                          disabled={pending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Id</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="e.g: FO22282E69E608"
                          type="text"
                          {...field}
                          disabled={pending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? profiles.find((p) => p.id === field.value)
                                      ?.name
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
                                            : "opacity-0",
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesPersonId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Sales Person</FormLabel>
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
                                        (u) => u.id === field.value,
                                      );
                                      return selected
                                        ? `${selected.fullName} (${selected.employeeId})`
                                        : "Select a person";
                                    })()
                                  : "Select a person"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Type 17002 employee id..."
                                  onInput={(e) =>
                                    setQuery(
                                      (e.target as HTMLInputElement).value,
                                    )
                                  }
                                />
                                <CommandList
                                  className="max-h-60 overflow-y-auto"
                                  onWheel={(e) => e.stopPropagation()}
                                  style={{ WebkitOverflowScrolling: "touch" }}
                                >
                                  {filteredUsers.length === 0 && (
                                    <CommandEmpty>
                                      No person found.
                                    </CommandEmpty>
                                  )}
                                  <CommandGroup>
                                    {filteredUsers.map((user: UserTypes) => (
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
                                              : "opacity-0",
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <Calendar className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Timeline</span>
                </div>
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order At</FormLabel>
                      <SmartDatePicker
                        value={field.value} // 👈 force controlled, placeholder shows
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline </FormLabel>
                      <SmartDatePicker
                        value={field.value} // 👈 same fix
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline </FormLabel>
                      <Select {...field}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <Select {...field}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((item) => (
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
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <Projector className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Project Information</span>
                </div>
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline </FormLabel>
                      <Input type="number" {...field} placeholder="eg: 500" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monetaryValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monetary Value </FormLabel>
                      <Input type="number" {...field} placeholder="eg: 500" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <Calendar className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Additional Information</span>
                </div>
                <FormField
                  control={form.control}
                  name="instructionSheet"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Instruction Sheet</FormLabel>
                      <FormControl>
                        <Input
                          startNativeIcon={
                            <Image
                              src={icons.Sheet}
                              alt="sheet"
                              height={15}
                              width={15}
                            />
                          }
                          className="w-full px-7"
                          placeholder="e.g https://drive.google.com/drive/folders"
                          type="text"
                          {...field}
                          disabled={pending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  Create project
                  {pending && <Loader2 className="animate-spin" />}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
