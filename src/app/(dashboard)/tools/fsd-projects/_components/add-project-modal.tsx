"use client";
import { createProject } from "@/actions/tools/fsd-projects/create";
import { editProject } from "@/actions/tools/fsd-projects/edit";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
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
import { Prisma, Profile, ProjectStatus, Team } from "@prisma/client";
import { Rating } from "@smastrom/react-rating";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import {
  Building,
  Calendar,
  Check,
  ChevronsUpDown,
  CircleStarIcon,
  Loader2,
  NotebookPen,
  Plus,
  Projector,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import "@smastrom/react-rating/style.css";
import { toast } from "sonner";

type UserTypes = Prisma.UserGetPayload<{
  select: {
    id: true;
    fullName: true;
    employeeId: true;
  };
}>;

interface Props {
  onClose?: () => void;
  open?: boolean;
  setOpen?: (p: boolean) => void;
  initialData?: SafeProjectDto;
}
export default function AddProjectModal({ open, initialData, setOpen }: Props) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const form = useForm<ProjectCreateSchemaType>({
    resolver: zodResolver(projectCreateSchema),
    // defaultValues: {
    //   clientName: initialData?.clientName ?? undefined,
    //   profileId: initialData?.profile.id ?? undefined,
    //   orderId: initialData?.orderId ?? undefined,
    //   salesPersonId: initialData?.salesPerson.id ?? undefined,
    //   orderDate: initialData?.orderDate ?? undefined,
    //   deadline: initialData?.deadline ?? undefined,
    //   shift: initialData?.shift ?? undefined,
    //   teamId: initialData?.team.id ?? undefined,
    //   delivered: initialData?.delivered ?? undefined,
    // },
  });

  // http://localhost:3000/api/users/fsd-members?membersOf=backend

  // grab profiles
  const { data: profiles, isError: isProfileError } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: () => fetch(`/api/profiles`).then((res) => res.json()),
  });

  // grab teams
  const { data: teams, isError: isTeamError } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => fetch(`/api/teams`).then((res) => res.json()),
  });

  // grab sales man
  const { data: users, isError: isUserError } = useQuery<UserTypes[]>({
    queryKey: ["users"],
    queryFn: () => fetch(`/api/users/salesPerson`).then((res) => res.json()),
  });

  // grab backend engineers
  const { data: backendEngineers, isError: isBackendUsersError } = useQuery<
    UserTypes[]
  >({
    queryKey: ["backendEngineers"],
    queryFn: () =>
      fetch(`/api/users/fsd-members?membersOf=backend`).then((res) =>
        res.json(),
      ),
  });
  // grab uiux designer
  const { data: uiuxDesigners, isError: isuiuxDesignerError } = useQuery<
    UserTypes[]
  >({
    queryKey: ["uiuxDesigners"],
    queryFn: () =>
      fetch(`/api/users/fsd-members?membersOf=uiux`).then((res) => res.json()),
  });
  // grab uiux designer
  const { data: frontendEngineers, isError: isFrontendUsersError } = useQuery<
    UserTypes[]
  >({
    queryKey: ["frontendEngineers"],
    queryFn: () =>
      fetch(`/api/users/fsd-members?membersOf=frontend`).then((res) =>
        res.json(),
      ),
  });

  const queryClient = useQueryClient();

  // Initialize Fuse
  const fuse = useMemo(() => {
    if (!users) return null;
    return new Fuse(users, {
      keys: ["fullName", "employeeId"],
      threshold: 0.3,
    });
  }, [users]);

  // Get filtered users
  const filteredUsers = useMemo(() => {
    if (!fuse || !query) return users;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, users]);

  function onSubmit(values: ProjectCreateSchemaType) {
    if (initialData) {
      // edit project
      startTransition(() => {
        editProject(initialData.id, values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          queryClient.invalidateQueries({ queryKey: ["fsd-projects"] });

          form.reset({
            clientName: "",
            orderId: "",
            profileId: "",
            salesPersonId: "",
            orderDate: undefined,
            deadline: undefined,
            shift: "",
            teamId: "",
            value: 0,
            monetaryValue: 0,
            instructionSheet: "",
          });
          setOpen?.(false);
        });
      });

      console.log(values);
    } else {
      // create a new project
      startTransition(() => {
        createProject(values).then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          toast.success(res.message);
          queryClient.invalidateQueries({ queryKey: ["fsd-projects"] });
          form.reset({
            clientName: "",
            orderId: "",
            profileId: "",
            salesPersonId: "",
            orderDate: undefined,
            deadline: undefined,
            shift: "",
            teamId: "",
            value: 0,
            monetaryValue: 0,
            instructionSheet: "",
          });
        });
      });
    }
  }

  useEffect(() => {
    if (!initialData) return;
    if (!profiles?.length) return; // 👈 THIS LINE FIXES IT

    form.reset({
      clientName: initialData.clientName ?? "",
      orderId: initialData.orderId ?? "",
      profileId: initialData.profile.id ?? "",
      salesPersonId: initialData.salesPerson.id ?? "",
      orderDate: initialData.orderDate
        ? new Date(initialData.orderDate)
        : undefined,
      deadline: initialData.deadline
        ? new Date(initialData.deadline)
        : undefined,
      delivered: initialData.delivered
        ? new Date(initialData.delivered)
        : undefined,
      shift: initialData.shift ?? "",
      teamId: initialData.team.id ?? "",
      value: initialData.value ?? undefined,
      monetaryValue: initialData.monetaryValue ?? undefined,
      instructionSheet: initialData.instructionSheet ?? "",
      status: initialData.status ?? undefined,
      review: initialData.review ?? undefined,
      quickNoteFromLeader: initialData?.quickNoteFromLeader ?? undefined,
      remarkFromOperation: initialData?.remarkFromOperation ?? undefined,
      // ✅ FIXED
      uiuxAssigned:
        initialData?.projectAssignments
          ?.filter((item) => item.role === "UIUX")
          .map((item) => item.userId) ?? [],
      backendAssigned:
        initialData?.projectAssignments
          ?.filter((item) => item.role === "BACKEND")
          .map((item) => item.userId) ?? [],
      frontendAssigned:
        initialData?.projectAssignments
          ?.filter((item) => item.role === "FRONTEND")
          .map((item) => item.userId) ?? [],
    });
  }, [initialData, form, profiles?.length]);

  if (
    isProfileError ||
    isTeamError ||
    isUserError ||
    isBackendUsersError ||
    isuiuxDesignerError ||
    isFrontendUsersError
  ) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>New Project</Button>
        </SheetTrigger>
        <SheetContent>
          <p className="text-sm text-red-500">
            Failed to load required data. Please refresh or contact support.
          </p>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!initialData && (
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
      )}
      <SheetContent className="w-full flex flex-col h-full px-2">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit" : "New"} Project</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 px-1"
            >
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
                                {field.value && profiles
                                  ? (profiles.find((p) => p.id === field.value)
                                      ?.name ?? "Select a profile")
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
                                  {profiles?.map((p) => (
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
                                      const selected = users?.find(
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
                                  {filteredUsers?.length === 0 && (
                                    <CommandEmpty>
                                      No person found.
                                    </CommandEmpty>
                                  )}
                                  <CommandGroup>
                                    {filteredUsers?.map((user: UserTypes) => (
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
                      <FormLabel>Shift</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
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
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams?.map((item) => (
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(ProjectStatus).map((item) => (
                            <SelectItem value={item} key={item}>
                              {item}
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
                  name="delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivered At</FormLabel>
                      <SmartDatePicker
                        value={field.value} // 👈 same fix
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <Calendar className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Project Update</span>
                </div>

                <FormField
                  control={form.control}
                  name="lastUpdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Update </FormLabel>
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
                  name="nextUpdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Update </FormLabel>
                      <SmartDatePicker
                        value={field.value} // 👈 same fix
                        onChange={field.onChange}
                      />
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
                      <FormLabel>Value </FormLabel>
                      <Input
                        type="number"
                        {...field}
                        placeholder="eg: 500"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
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
                      <Input
                        type="number"
                        {...field}
                        placeholder="eg: 500"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {initialData?.status === "Delivered" && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-x-3 mt-2 col-span-2">
                    <CircleStarIcon className="size-4 text-primary-yellow" />{" "}
                    <span className="text-sm">Review/Rating</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem>
                        <Rating
                          onChange={field.onChange}
                          value={field.value ?? 0}
                          style={{
                            width: "100px",
                          }}
                        />

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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

              <div className="grid gap-3 mt-2">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <NotebookPen className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Note/Remarks</span>
                </div>
                <FormField
                  control={form.control}
                  name="quickNoteFromLeader"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (Leader)</FormLabel>
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Quick Note from leader"
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarkFromOperation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (operation)</FormLabel>
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Note from operation"
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-5 mt-2">
                <div className="flex items-center gap-x-3 mt-2 col-span-2">
                  <Users className="size-4 text-primary-yellow" />{" "}
                  <span className="text-sm">Assignment</span>
                </div>

                <FormField
                  control={form.control}
                  name="uiuxAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> UI/UX Members
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={uiuxDesigners!.map((u) => ({
                            label: `${u.fullName} (${u.employeeId})`,
                            value: u.id,
                          }))}
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          placeholder="Choose ui/ux members"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backendAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Backend Members
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={backendEngineers!.map((u) => ({
                            label: `${u.fullName} (${u.employeeId})`,
                            value: u.id,
                          }))}
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          placeholder="Choose backend members"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frontendAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Frontend Members
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={frontendEngineers!.map((u) => ({
                            label: `${u.fullName} (${u.employeeId})`,
                            value: u.id,
                          }))}
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          placeholder="Choose frontend members"
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
                    setOpen?.(false);
                  }}
                  type="button"
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {initialData ? "Save Now" : "Create project"}
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
