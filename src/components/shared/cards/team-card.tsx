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
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Users,
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: string;
}

interface Team {
  name: string;
  members: Member[];
  stats: {
    active: number;
    completed: number;
    pending: number;
  };
}

interface Service {
  id: number;
  name: string;
  teams: Team[];
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const totalMembers = service.teams.reduce(
    (acc, team) => acc + team.members.length,
    0
  );
  const totalActive = service.teams.reduce(
    (acc, team) => acc + team.stats.active,
    0
  );
  const totalCompleted = service.teams.reduce(
    (acc, team) => acc + team.stats.completed,
    0
  );
  const totalPending = service.teams.reduce(
    (acc, team) => acc + team.stats.pending,
    0
  );

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
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Service</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/teams/manage-teams/${service.id}`}>Manage Teams</a>
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
            <span>{service.teams.length} teams</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="text-lg font-semibold">{totalActive}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Done</span>
            </div>
            <div className="text-lg font-semibold">{totalCompleted}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="text-lg font-semibold">{totalPending}</div>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Teams
          </h4>
          {service.teams.map((team, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {team.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {team.members.length} members
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-orange-600">
                    {team.stats.active} active
                  </span>
                  <span className="text-green-600">
                    {team.stats.completed} done
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member) => (
                    <Avatar
                      key={member.id}
                      className="w-8 h-8 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{team.members.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                {team.members.length > 0 && (
                  <div className="text-xs text-muted-foreground ml-2">
                    {team.members[0].name}
                    {team.members.length > 1 &&
                      ` and ${team.members.length - 1} others`}
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
