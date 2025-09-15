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
import { ServiceWithTeamsAndUsers } from "@/types/services";
import { MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  service: ServiceWithTeamsAndUsers;
}

export default function ServiTeaceCard({ service }: ServiceCardProps) {
  const totalMembers = service.users.length;
  const totalTeams = service.teams.length;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
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
              <DropdownMenuItem asChild>
                <a href={`/service/${service.id}`}>View Details</a>
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Service</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/teams/manage-teams/${service.id}`}>
                  Manage Teams
                </Link>
              </DropdownMenuItem>
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
                <div className="flex gap-2 text-xs">
                  <span className="text-orange-600">
                    {Math.floor(Math.random() * 10) + 2} active
                  </span>
                  <span className="text-green-600">
                    {Math.floor(Math.random() * 20) + 5} done
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
