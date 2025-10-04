import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import prisma from "@/lib/prisma";
import { TeamResponsibility } from "@prisma/client";
import { MoreHorizontal, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import BackPrevPage from "./_components/back-previous-page";
import RemoveMemberAction from "./_components/remove-member-action";
import ResponsibilityAction from "./_components/responsibility-action";
const TeamManageDropdown = dynamic(
  () => import("./_components/team-manage-dropdown"),
  {
    ssr: false,
  }
);

const AddTeamModal = dynamic(
  () => import("@/components/shared/modal/add-team-modal"),
  {
    ssr: false,
  }
);

const responsibilityLabels: Record<TeamResponsibility, string> = {
  [TeamResponsibility.Leader]: "Team Leader",
  [TeamResponsibility.Coleader]: "Co-Leader",
  [TeamResponsibility.Member]: "Member",
};

export default async function ManageTeamsPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const teams = await prisma.team.findMany({
    where: {
      serviceId: params.serviceId,
    },
    include: {
      userTeams: {
        include: {
          user: {
            include: {
              designation: true,
            },
          },
        },
      },
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  // sort userTeams manually
  const priority: Record<string, number> = {
    Leader: 1,
    Coleader: 2,
    Member: 3,
  };

  teams.forEach((team) => {
    team.userTeams.sort(
      (a, b) => priority[a.responsibility] - priority[b.responsibility]
    );
  });

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackPrevPage />

            <div>
              <h1 className="text-lg font-bold text-balance">Manage Teams</h1>
              <p className="text-muted-foreground">
                {teams[0]?.service?.name ?? ""} Service
              </p>
            </div>
          </div>
          <AddTeamModal
            serviceId={params.serviceId}
            trigger={
              <Button effect="gooeyLeft">
                <Plus className="w-4 h-4 mr-1" />
                Add Team
              </Button>
            }
          />
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6">
          {teams.map((team, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <Badge variant="secondary">
                      {team.userTeams.length} members
                    </Badge>
                  </div>
                  <TeamManageDropdown
                    teamId={team.id}
                    teamName={team.name}
                    serviceId={params.serviceId}
                  />
                </div>
              </CardHeader>

              <CardContent>
                {/* Team Members */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Team Members
                  </h4>
                  <div className="grid gap-3">
                    {team.userTeams.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={member.user.image ?? "/placeholder.avif"}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {member.user.fullName}
                              </AvatarFallback>
                            </Avatar>
                            {/* <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                            /> */}
                          </div>
                          <div>
                            <div className="font-medium">
                              {member.user.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.user.designation.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {responsibilityLabels[member.responsibility]}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="flex flex-col justify-start items-start"
                            >
                              <ResponsibilityAction
                                teamId={member.teamId}
                                userId={member.userId}
                                teamName={team.name}
                                responsibility={member.responsibility}
                              />
                              <RemoveMemberAction
                                teamId={member.teamId}
                                userId={member.userId}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
