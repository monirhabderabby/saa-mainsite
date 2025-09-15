import AddTeamModal from "@/components/shared/modal/add-team-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "@/lib/prisma";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import TeamManageDropdown from "./_components/team-manage-dropdown";

export default async function ManageTeamsPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const services = await prisma.services.findMany();
  const teams = await prisma.team.findMany({
    where: {
      serviceId: params.serviceId,
    },
    include: {
      userTeams: true,
      service: {
        select: {
          name: true,
        },
      },
    },
  });
  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/teams">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-balance">Manage Teams</h1>
              <p className="text-muted-foreground">
                {teams[0].service?.name} Service
              </p>
            </div>
          </div>
          <AddTeamModal
            services={services}
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
                  <TeamManageDropdown teamId={team.id} />
                </div>
              </CardHeader>

              <CardContent>
                {/* Team Members */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Team Members
                  </h4>
                  {/* add members here */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

//  <div className="grid gap-3">
//                     {team.members.map((member) => (
//                       <div
//                         key={member.id}
//                         className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="relative">
//                             <Avatar className="w-10 h-10">
//                               <AvatarFallback className="bg-primary/10 text-primary font-medium">
//                                 {member.avatar}
//                               </AvatarFallback>
//                             </Avatar>
//                             {/* <div
//                               className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
//                             /> */}
//                           </div>
//                           <div>
//                             <div className="font-medium">{member.name}</div>
//                             <div className="text-sm text-muted-foreground">
//                               {member.role}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Badge
//                             variant="outline"
//                             className="text-xs capitalize"
//                           >
//                             {member.status}
//                           </Badge>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="icon">
//                                 <MoreHorizontal className="w-4 h-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem>View Profile</DropdownMenuItem>
//                               <DropdownMenuItem>Change Role</DropdownMenuItem>
//                               <DropdownMenuItem className="text-red-600">
//                                 Remove from Team
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
