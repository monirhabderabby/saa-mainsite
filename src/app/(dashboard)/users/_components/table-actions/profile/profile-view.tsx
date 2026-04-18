// components/profile-view.tsx
"use client";

import { getUserOptions } from "@/actions/user/get-user-options";
import { updateUserInfo } from "@/actions/user/info-update";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { UserWithAllIncludes } from "@/types/user";
import { Department, Designations, EmployeeStatus, Services, Team } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  User as UserIcon,
  Users,
  XCircle
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { PermissionSwitch } from "./permission-switch";

interface ProfileViewProps {
  trigger: ReactNode;
  user: UserWithAllIncludes;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p className="text-xs text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ProfileView({ trigger, user }: ProfileViewProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: user.fullName ?? "",
    nickName: user.nickName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
    parmanentAddress: user.parmanentAddress ?? "",
    presentAddress: user.presentAddress ?? "",
    employeeStatus: user.employeeStatus ?? "PROBATION",
    departmentId: user.departmentId ?? "",
    serviceId: user.serviceId ?? "",
    designationId: user.designationId ?? "",
    teamId: user.userTeams?.[0]?.teamId ?? "",
  });

  const [options, setOptions] = useState<{
    departments: Department[];
    services: Services[];
    teams: Team[];
    designations: Designations[];
  }>({
    departments: [],
    services: [],
    teams: [],
    designations: [],
  });

  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        console.log(loadingOptions)
        setLoadingOptions(true);
        const result = await getUserOptions();
        if (result.success && result.data) {
          setOptions(result.data);
        }
        setLoadingOptions(false);
      };
      fetchOptions();
    }
  }, [open]);

  // Cascading lists
  const filteredServices = options.services.filter(
    (s) => !form.departmentId || s.departmentId === form.departmentId
  );
  const filteredTeams = options.teams.filter(
    (t) => !form.serviceId || t.serviceId === form.serviceId
  );
  const filteredDesignations = options.designations.filter(
    (d) => !form.serviceId || d.serviceId === form.serviceId
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const result = await updateUserInfo({
      id: user.id,
      fullName: form.fullName,
      nickName: form.nickName,
      email: form.email,
      phone: form.phone || undefined,
      dateOfBirth: form.dateOfBirth || null,
      parmanentAddress: form.parmanentAddress || undefined,
      presentAddress: form.presentAddress || undefined,
      employeeStatus: form.employeeStatus as EmployeeStatus,
      departmentId: form.departmentId || undefined,
      serviceId: form.serviceId || undefined,
      designationId: form.designationId || undefined,
      teamId: form.teamId || undefined,
    });
    setSaving(false);

    if (result.success) {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } else {
      toast.error(result.message);
    }
  };

  const statusColor =
    user.accountStatus === "ACTIVE"
      ? "text-emerald-500"
      : user.accountStatus === "DEACTIVE"
        ? "text-red-500"
        : "text-amber-500";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      {/* Fixed height dialog with flex column layout */}
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden h-[90vh] flex flex-col">
        {/* ── Header strip (fixed, never scrolls) ── */}
        <div className="relative bg-primary px-5 pt-5 pb-12 shrink-0">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
              Employee Profile
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-white/10">
              <AvatarImage src={user.image ?? ""} alt={user.fullName ?? ""} />
              <AvatarFallback className="text-sm font-bold bg-slate-700 text-white">
                {getInitials(user.fullName ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">
                {user.fullName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                @{user.nickName} · #{user.employeeId}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 bg-white/10 text-slate-300 border-0 rounded-sm"
                >
                  {user.userTeams?.[0]?.team?.name ?? "No Team"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 bg-white/10 text-slate-300 border-0 rounded-sm"
                >
                  {user.role}
                </Badge>
                <span className={`text-[10px] font-medium ${statusColor}`}>
                  ● {user.accountStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs panel (scrollable body) ── */}
        <div className="-mt-3 px-4 flex-1 min-h-0 flex flex-col z-30">
          <Tabs
            defaultValue="overview"
            className="w-full flex flex-col flex-1 min-h-0"
          >
            {/* Tab bar (fixed inside the tabs, never scrolls) */}
            <TabsList className="h-8 text-[11px] bg-white dark:bg-slate-900 shadow-md rounded-lg w-full grid grid-cols-3 shrink-0">
              <TabsTrigger value="overview" className="text-[11px] h-6">
                Overview
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-[11px] h-6">
                Edit Info
              </TabsTrigger>
              <TabsTrigger value="permissions" className="text-[11px] h-6">
                Permissions
              </TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW TAB ── */}
            <TabsContent value="overview" className="flex-1 min-h-0 mt-3">
              <ScrollArea className="h-full pr-1">
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {/* Personal */}
                  <Card className="border-border/50">
                    <CardContent className="px-3 pt-3 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        Personal
                      </p>
                      <Separator className="mb-2" />
                      <InfoRow
                        icon={UserIcon}
                        label="Full Name"
                        value={user.fullName}
                      />
                      <InfoRow
                        icon={Hash}
                        label="Employee ID"
                        value={user.employeeId}
                      />
                      <InfoRow icon={Mail} label="Email" value={user.email} />
                      <InfoRow icon={Phone} label="Phone" value={user.phone} />
                      <InfoRow
                        icon={CalendarIcon}
                        label="Date of Birth"
                        value={
                          user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString()
                            : null
                        }
                      />
                    </CardContent>
                  </Card>

                  {/* Work */}
                  <Card className="border-border/50">
                    <CardContent className="px-3 pt-3 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        Work
                      </p>
                      <Separator className="mb-2" />
                      <InfoRow
                        icon={Building2}
                        label="Department"
                        value={user.department?.name}
                      />
                      <InfoRow
                        icon={Shield}
                        label="Designation"
                        value={user.designation?.name}
                      />
                      <InfoRow
                        icon={Users}
                        label="Team"
                        value={user.userTeams?.[0]?.team?.name}
                      />
                      <InfoRow
                        icon={CheckCircle2}
                        label="Employee Status"
                        value={user.employeeStatus}
                      />
                      <InfoRow
                        icon={XCircle}
                        label="Account Status"
                        value={user.accountStatus}
                      />
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card className="col-span-2 border-border/50">
                    <CardContent className="px-3 pt-3 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        Address
                      </p>
                      <Separator className="mb-2" />
                      <div className="grid grid-cols-2 gap-x-4">
                        <InfoRow
                          icon={MapPin}
                          label="Present Address"
                          value={user.presentAddress}
                        />
                        <InfoRow
                          icon={MapPin}
                          label="Permanent Address"
                          value={user.parmanentAddress}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── EDIT TAB ── */}
            <TabsContent value="edit" className="flex-1 min-h-0 mt-3">
              <ScrollArea className="h-full pr-1">
                <div className="pb-4">
                  <Card className="border-border/50">
                    <CardContent className="px-4 pt-4 pb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Full Name
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={form.fullName}
                            onChange={(e) =>
                              handleChange("fullName", e.target.value)
                            }
                          />
                        </div>

                        {/* Nick Name */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Nick Name
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={form.nickName}
                            onChange={(e) =>
                              handleChange("nickName", e.target.value)
                            }
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Email
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              handleChange("email", e.target.value)
                            }
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Phone
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={form.phone}
                            onChange={(e) =>
                              handleChange("phone", e.target.value)
                            }
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Date of Birth
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-8 px-2 justify-start text-left font-normal text-xs",
                                  !form.dateOfBirth && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {form.dateOfBirth ? (
                                  format(form.dateOfBirth, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={form.dateOfBirth}
                                onSelect={(date) =>
                                  handleChange("dateOfBirth", date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Employee Status */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Employee Status
                          </Label>
                          <Select
                            value={form.employeeStatus}
                            onValueChange={(v) =>
                              handleChange("employeeStatus", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROBATION" className="text-xs">
                                Probation
                              </SelectItem>
                              <SelectItem value="PARMANENT" className="text-xs">
                                Permanent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Department */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Department
                          </Label>
                          <Select
                            value={form.departmentId}
                            onValueChange={(v) => {
                              setForm((prev) => ({
                                ...prev,
                                departmentId: v,
                                serviceId: "",
                                teamId: "",
                                designationId: "",
                              }));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.departments.map((dept) => (
                                <SelectItem
                                  key={dept.id}
                                  value={dept.id}
                                  className="text-xs"
                                >
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Service */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Service
                          </Label>
                          <Select
                            value={form.serviceId}
                            disabled={!form.departmentId}
                            onValueChange={(v) => {
                              setForm((prev) => ({
                                ...prev,
                                serviceId: v,
                                teamId: "",
                                designationId: "",
                              }));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Service" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredServices.map((service) => (
                                <SelectItem
                                  key={service.id}
                                  value={service.id}
                                  className="text-xs"
                                >
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Team */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Team
                          </Label>
                          <Select
                            value={form.teamId}
                            disabled={!form.serviceId}
                            onValueChange={(v) => handleChange("teamId", v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredTeams.map((team) => (
                                <SelectItem
                                  key={team.id}
                                  value={team.id}
                                  className="text-xs"
                                >
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Designation */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Designation
                          </Label>
                          <Select
                            value={form.designationId}
                            disabled={!form.serviceId}
                            onValueChange={(v) =>
                              handleChange("designationId", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Designation" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredDesignations.map((desig) => (
                                <SelectItem
                                  key={desig.id}
                                  value={desig.id}
                                  className="text-xs"
                                >
                                  {desig.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Present Address */}
                        <div className="space-y-1 col-span-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Present Address
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={form.presentAddress}
                            onChange={(e) =>
                              handleChange("presentAddress", e.target.value)
                            }
                          />
                        </div>

                        {/* Permanent Address */}
                        <div className="space-y-1 col-span-1">
                          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Permanent Address
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            value={form.parmanentAddress}
                            onChange={(e) =>
                              handleChange("parmanentAddress", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="h-8 text-xs px-4 bg-[#FFC300] hover:bg-[#e6b000] text-black font-semibold"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                              Saving…
                            </>
                          ) : (
                            <>
                              <Pencil className="h-3 w-3 mr-1.5" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── PERMISSIONS TAB ── */}
            <TabsContent value="permissions" className="flex-1 min-h-0 mt-3">
              <ScrollArea className="h-full pr-1">
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {user.permissions.map((p) => (
                    <Card key={p.id} className="border-border/50">
                      <CardContent className="px-3 pt-3 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                          {p.name.replace("_", " ")}
                        </p>
                        <Separator className="mb-3" />
                        <div className="space-y-2.5">
                          {p.name === "ISSUE_SHEET" && (
                            <>
                              <PermissionSwitch
                                label="Issue Create"
                                checked={p.isIssueCreateAllowed}
                                permissionId={p.id}
                                field="isIssueCreateAllowed"
                              />
                              <PermissionSwitch
                                label="Issue Update"
                                checked={p.isIssueUpdatAllowed}
                                permissionId={p.id}
                                field="isIssueUpdatAllowed"
                              />
                            </>
                          )}
                          {p.name === "UPDATE_SHEET" && (
                            <>
                              <PermissionSwitch
                                label="Update By"
                                checked={p.isMessageCreateAllowed}
                                permissionId={p.id}
                                field="isMessageCreateAllowed"
                              />
                              <PermissionSwitch
                                label="TL Check"
                                checked={p.isMessageTLCheckAllowed}
                                permissionId={p.id}
                                field="isMessageTLCheckAllowed"
                              />
                              <PermissionSwitch
                                label="Done By"
                                checked={p.isMessageDoneByAllowed}
                                permissionId={p.id}
                                field="isMessageDoneByAllowed"
                              />
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
