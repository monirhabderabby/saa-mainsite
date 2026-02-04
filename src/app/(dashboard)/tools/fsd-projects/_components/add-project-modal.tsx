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
  Building2,
  CalendarRange,
  Check,
  ChevronsUpDown,
  Clock,
  DollarSign,
  FileText,
  LinkIcon,
  Loader2,
  NotebookPen,
  Plus,
  SheetIcon,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Card } from "@/components/ui/card";
import InfoToolTip from "@/components/ui/custom/info-tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  });

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

          // reset the form
          formReset();
          setOpen?.(false);
        });
      });
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

          // reset the form
          formReset();
        });
      });
    }
  }

  const formReset = () => {
    form.reset({
      title: "",
      shortDescription: "",
      clientName: "",
      orderId: "",
      profileId: "",
      salesPersonId: "",
      orderDate: undefined,
      deadline: undefined,
      shift: "",
      teamId: "",
      status: undefined,
      delivered: undefined,
      probablyWillBeDeliver: undefined,
      review: undefined,
      quickNoteFromLeader: undefined,
      remarkFromOperation: undefined,
      lastUpdate: undefined,
      nextUpdate: undefined,
      uiuxAssigned: undefined,
      frontendAssigned: undefined,
      backendAssigned: undefined,
      value: 0,
      monetaryValue: 0,
      instructionSheet: "",
    });
  };

  useEffect(() => {
    if (!initialData) return;
    if (!profiles?.length) return; // 👈 THIS LINE FIXES IT

    form.reset({
      title: initialData.title ?? "",
      shortDescription: initialData.shortDescription ?? "",
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
      probablyWillBeDeliver: initialData.probablyWillBeDeliver
        ? new Date(initialData.probablyWillBeDeliver)
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
      lastUpdate: initialData?.lastUpdate ?? undefined,
      nextUpdate: initialData?.nextUpdate ?? undefined,
      supportPeriodStart: initialData?.supportPeriodStart ?? undefined,
      supportPeriodEnd: initialData?.supportPeriodEnd ?? undefined,
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

  const value = form.watch("value");

  useEffect(() => {
    if (value == null || value === 0) {
      form.setValue("monetaryValue", 0);
      return;
    }

    const numericValue = Number(value);

    if (!isNaN(numericValue)) {
      form.setValue("monetaryValue", numericValue * 0.8);
    }
  }, [value, form]);

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
      <SheetContent className="w-full bg-[#F9FAFB] flex flex-col h-full px-2">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit" : "New"} Project</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-7 px-1"
            >
              {/* basic information */}
              <Card className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 shadow-none">
                <div className="flex items-center gap-x-2 mt-2 col-span-2">
                  <div className="bg-[#FFFBEB] p-3 rounded-lg">
                    <FileText className="size-4 text-[#D97706]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Basic Information
                    </span>
                    <span className="font-normal text-[10px] text-muted-foreground">
                      Supplementary project details
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="e.g: Biblioteca Legal"
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
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="e.g: Complete UI/UX redesign with frontend and backend integration"
                          type="text"
                          {...field}
                          disabled={pending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
              {/* client information */}
              <Card className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 shadow-none">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#EFF6FF] p-3 rounded-lg">
                    <Building2 className="size-4  text-[#2563EB]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Client Information
                    </span>
                    <span className="font-normal text-[10px]">
                      Basic client and order details
                    </span>
                  </div>
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
              </Card>

              {/* timeline */}
              <Card className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 shadow-none">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#FAF5FF] p-3 rounded-lg">
                    <CalendarRange className="size-4  text-[#9333EA]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Timeline</span>
                    <span className="font-normal text-[10px]">
                      Project schedule and status tracking
                    </span>
                  </div>
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
                      <div className="flex items-center gap-x-1">
                        <FormLabel>Delivered At</FormLabel>
                        <InfoToolTip
                          animation="fade"
                          placement="top"
                          content="Used for delivery tracking and reporting. Select when the project was officially delivered."
                        />
                      </div>
                      <SmartDatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {initialData?.status === "Delivered" && (
                  <>
                    <FormField
                      control={form.control}
                      name="supportPeriodStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Period Start</FormLabel>
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
                      name="supportPeriodEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Period End</FormLabel>
                          <SmartDatePicker
                            value={field.value} // 👈 same fix
                            onChange={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="probablyWillBeDeliver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Probably Will Be Delivered At</FormLabel>
                      <SmartDatePicker
                        value={field.value} // 👈 same fix
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* financial information */}
              <Card className="grid grid-cols-2 gap-3 mt-2 shadow-none p-4">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#F0FDF4] p-3 rounded-lg">
                    <DollarSign className="size-4  text-[#16A34A]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Financial Information
                    </span>
                    <span className="font-normal text-[10px]">
                      Project value and monetary details
                    </span>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value </FormLabel>
                      <InputGroup>
                        <InputGroupInput
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
                        <InputGroupAddon>
                          <DollarSign />
                        </InputGroupAddon>
                      </InputGroup>

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
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          disabled
                          {...field}
                          placeholder="eg: 400"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                        <InputGroupAddon>
                          <DollarSign />
                        </InputGroupAddon>
                      </InputGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 shadow-none">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#FFF7ED] p-3 rounded-lg">
                    <Clock
                      strokeWidth={2.75}
                      className="size-4  text-[#EA580C]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Project Updates</span>
                    <span className="font-normal text-[10px]">
                      Track update schedule
                    </span>
                  </div>
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
              </Card>

              <Card className="grid gap-3 mt-2 shadow-none p-4">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#FEFCE8] p-3 rounded-lg">
                    <NotebookPen className="size-4  text-[#CA8A04]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Notes & Remarks</span>
                    <span className="font-normal text-[10px]">
                      Additional project information
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="instructionSheet"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Instruction Sheet</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            placeholder="e.g https://drive.google.com/drive/folders"
                          />
                          <InputGroupAddon>
                            <SheetIcon className="text-[#00AC47]" />
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quickNoteFromLeader"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quick Note from leader</FormLabel>
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
                      <FormLabel>Remark from Operation</FormLabel>
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Note from operation"
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
              <Card className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-5 mt-2 shadow-none p-4">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#EEF2FF] p-3 rounded-lg">
                    <Users
                      strokeWidth={2.75}
                      className="size-4  text-[#4F46E5]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Project Assignment
                    </span>
                    <span className="font-normal text-[10px]">
                      Assign team member to roles
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="uiuxAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-3 h-3" /> UI/UX Members
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
                        <Users className="w-3 h-3" /> Backend Members
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
                        <Users className="w-3 h-3" /> Frontend Members
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
              </Card>
              <Card className="grid gap-3 mt-2 shadow-none p-4">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#F0FDFA] p-3 rounded-lg">
                    <LinkIcon className="size-4  text-[#1D9B90]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Optional Resources
                    </span>
                    <span className="font-normal text-[10px]">
                      External links and tracking sheets
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="progressSheet"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Progress Sheet</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="https://" />
                          <InputGroupAddon>
                            <SheetIcon className="text-[#00AC47]" />
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credentialSheet"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Credential Sheet</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="https://" />
                          <InputGroupAddon>
                            <SheetIcon className="text-[#00AC47]" />
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteIssueTrackerSheet"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Website Issue Tracker Sheet</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="https://" />
                          <InputGroupAddon>
                            <SheetIcon className="text-[#00AC47]" />
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="grid gap-3 mt-2 shadow-none p-4">
                <div className="flex items-center gap-x-2 mt-2 col-span-2 ">
                  <div className="bg-[#FDF2F8] p-3 rounded-lg">
                    <Star className="size-4 stroke-[#DB2777]  fill-[#DB2777]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Client Rating</span>
                    <span className="font-normal text-[10px]">
                      Rate your experience with this client
                    </span>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
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
              </Card>
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
