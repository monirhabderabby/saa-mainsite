import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import prisma from "@/lib/prisma";
import { ServiceWithTeamsAndUsers } from "@/types/services";
import { MoreHorizontal, User, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
const AddServiceManagerModal = dynamic(
  () => import("@/components/shared/modal/add-service-manager-modal"),
  {
    ssr: false,
  }
);

interface ServiceCardProps {
  service: ServiceWithTeamsAndUsers;
}

export default async function ServiTeaceCard({ service }: ServiceCardProps) {
  const totalMembers = service.users.length;
  const totalTeams = service.teams.length;
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      employeeId: true,
    },
    where: {
      managedServices: {
        none: {},
      },
      userTeams: {
        none: {
          team: {
            name: "Management",
          },
        },
      },
      serviceId: service.id,
    },
  });

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 dark:bg-white/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {service.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <Link href={`/services/${service.id}`}>View Details</Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Edit Service</DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                <Link href={`/teams/manage-teams/${service.id}`}>
                  Manage Teams
                </Link>
              </DropdownMenuItem>
              <AddServiceManagerModal
                serviceId={service.id}
                serviceName={service.name}
                users={users}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm pr-2 px-0 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 w-full"
                  >
                    Add Manager
                  </Button>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalMembers} members</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{totalTeams} teams</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />{" "}
            <span>{service.serviceManager?.fullName}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Teams */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Teams
          </h4>
          {service.teams.map((team) => (
            <div
              key={team.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {team.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {team.userTeams.length} members
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {team.userTeams.slice(0, 4).map((userTeam) => (
                    <Avatar
                      key={userTeam.user.id}
                      className="w-8 h-8 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs bg-slate-600 text-white font-medium">
                        {userTeam.user.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") ||
                          userTeam.user.employeeId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.userTeams.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{team.userTeams.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                {team.userTeams.length > 0 && (
                  <div className="text-xs text-muted-foreground ml-2">
                    {team.userTeams[0].user.fullName ||
                      team.userTeams[0].user.employeeId}
                    {team.userTeams.length > 1 &&
                      ` and ${team.userTeams.length - 1} others`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
