"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserWithAllIncludes } from "@/types/user";
import { Hash, Mail, User as UserIcon, Users } from "lucide-react";
import { ReactNode, useState } from "react";
import { PermissionSwitch } from "./permission-switch";

interface ProfileViewProps {
  trigger: ReactNode;
  user: UserWithAllIncludes;
}

export function ProfileView({ trigger, user }: ProfileViewProps) {
  const [open, setOpen] = useState(false);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-center">Profile Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`/placeholder.svg?height=80&width=80&query=professional+profile+photo`}
                alt={user.fullName as string}
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user.fullName as string)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-balance">
                {user.fullName}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {user.userTeams.length > 0
                  ? user.userTeams[0].team.name
                  : "Not Found"}
              </Badge>
            </div>
          </div>

          {/* Profile Information */}
          <Card className="dark:bg-white/5">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">ID</p>
                  <p className="text-sm text-muted-foreground">
                    {user.employeeId}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {user.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Team</p>
                  <p className="text-sm text-muted-foreground">
                    {user.userTeams.length > 0
                      ? user.userTeams[0].team.name
                      : "Not Found"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Permissions */}
          <div className="grid grid-cols-2 gap-5">
            {user.permissions.map((p) => (
              <Card key={p.id} className="bg-white/5">
                <CardContent className="pt-6">
                  <h4 className="text-lg font-semibold mb-4 text-center">
                    {p.name} Permissions
                  </h4>
                  <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
