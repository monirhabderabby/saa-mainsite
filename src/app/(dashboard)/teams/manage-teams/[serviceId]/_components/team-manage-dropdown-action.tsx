"use client";

const AddMemberModal = dynamic(
  () => import("@/components/shared/modal/add-member-modal"),
  {
    ssr: false,
  }
);
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
const TeamDeleteAction = dynamic(() => import("./team-delete-action"), {
  ssr: false,
});

interface Props {
  teamId: string;
  teamName: string;
  serviceId: string;
  users: User[];
}

const TeamManageDropdownAction = ({ teamName, teamId, users }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="space-y-2">
        <AddMemberModal
          teamName={teamName}
          teamId={teamId}
          users={users}
          onClose={() => setOpen(false)}
        />

        <TeamDeleteAction teamId={teamId} onClose={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamManageDropdownAction;
