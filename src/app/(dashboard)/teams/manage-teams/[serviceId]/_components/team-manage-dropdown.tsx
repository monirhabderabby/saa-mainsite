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
import prisma from "@/lib/prisma";
import { MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import TeamDeleteAction from "./team-delete-action";

interface Props {
  teamId: string;
  teamName: string;
  serviceId: string;
}

const TeamManageDropdown = async ({ teamId, teamName, serviceId }: Props) => {
  const users = await prisma.user.findMany({
    where: {
      userTeams: {
        none: {
          teamId: teamId,
        },
      },
      serviceId: serviceId,
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="space-y-2">
        <AddMemberModal teamName={teamName} teamId={teamId} users={users} />

        <TeamDeleteAction teamId={teamId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamManageDropdown;
