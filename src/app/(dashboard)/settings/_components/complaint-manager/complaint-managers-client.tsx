"use client";

import {
  addComplaintManager,
  removeComplaintManager,
} from "@/actions/complains";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Shield, ShieldOff, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
type Manager = {
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
    image: string | null;
    employeeId: string;
    designation: { name: string } | null;
    department: { name: string } | null;
  };
};

type User = Manager["user"];

interface Props {
  managers: Manager[];
  users: User[];
}

// ── Avatar helper ──────────────────────────────────────────────────────────────
function UserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" }) {
  const initials = user.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={size === "sm" ? "h-8 w-8" : "h-10 w-10"}>
      <AvatarImage src={user.image ?? undefined} alt={user.fullName} />
      <AvatarFallback className="text-xs font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ComplaintManagersClient({
  managers: initial,
  users: initialUsers,
}: Props) {
  const [managers, setManagers] = useState<Manager[]>(initial);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Add ──
  function handleAdd(user: User) {
    startTransition(async () => {
      const res = await addComplaintManager(user.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      // Optimistic update
      setManagers((prev) => [
        { userId: user.id, createdAt: new Date(), user },
        ...prev,
      ]);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setOpen(false);
      toast.success(`${user.fullName} added as complaint manager.`);
    });
  }

  // ── Remove ──
  function handleRemove(userId: string, name: string) {
    setRemovingId(userId);
    startTransition(async () => {
      const res = await removeComplaintManager(userId);
      if (res?.error) {
        toast.error(res.error);
        setRemovingId(null);
        return;
      }
      const removed = managers.find((m) => m.userId === userId);
      setManagers((prev) => prev.filter((m) => m.userId !== userId));
      if (removed) setUsers((prev) => [...prev, removed.user]);
      setRemovingId(null);
      toast.success(`${name} removed from complaint managers.`);
    });
  }

  return (
    <div className=" py-10 px-4 space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold tracking-tight">
              Complaint Managers
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Users listed here have admin-level access to all complaints.
          </p>
        </div>

        {/* ── Add Manager Dialog ── */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add manager
            </Button>
          </DialogTrigger>

          <DialogContent className="p-0 gap-0 max-w-md">
            <DialogHeader className="px-5 pt-5 pb-3">
              <DialogTitle>Add complaint manager</DialogTitle>
              <DialogDescription>
                Search and select a user to grant manager access.
              </DialogDescription>
            </DialogHeader>
            <Separator />

            <Command className="rounded-none border-none shadow-none">
              <CommandInput placeholder="Search by name or employee ID..." />
              <CommandList className="max-h-72">
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-1.5 py-6">
                    <Users className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No users found
                    </p>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.fullName} ${user.employeeId}`}
                      onSelect={() => handleAdd(user)}
                      disabled={isPending}
                      className="px-4 py-2.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <UserAvatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.designation?.name ?? "—"} · {user.employeeId}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0"
                        >
                          {user.department?.name ?? "—"}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            <Separator />
            <DialogFooter className="px-4 py-3">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Managers list card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Active managers
            </CardTitle>
            <Badge variant="secondary">{managers.length}</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {managers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <ShieldOff className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                No managers assigned
              </p>
              <p className="text-xs text-muted-foreground/70">
                Add a user above to grant complaint manager access.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {managers.map((m, i) => (
                <li
                  key={m.userId}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  {/* Index */}
                  <span className="text-xs text-muted-foreground/50 w-5 text-right shrink-0">
                    {i + 1}
                  </span>

                  <UserAvatar user={m.user} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {m.user.fullName}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {m.user.employeeId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.user.designation?.name ?? "—"}
                      {m.user.department?.name
                        ? ` · ${m.user.department.name}`
                        : ""}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground/60 hidden sm:block shrink-0">
                    Added{" "}
                    {new Date(m.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* Remove */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0"
                      >
                        {removingId === m.userId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldOff className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline text-xs">Remove</span>
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove manager access?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{m.user.fullName}</strong> will lose complaint
                          manager access and revert to a standard user view.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleRemove(m.userId, m.user.fullName)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Footer note ── */}
      <p className="text-xs text-muted-foreground text-center">
        Complaint managers can view, update status, and manage all complaints
        across the organization.
      </p>
    </div>
  );
}
