import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { placeholderImage } from "@/constants/assets";
import { Users } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface TeamSection {
  role: string;
  members: TeamMember[];
  // Use: "bg-pink-100 dark:bg-pink-900/30"
  backgroundColor?: string;
}

interface TeamAssignmentsCardProps {
  teams: TeamSection[];
}

export function TeamAssignmentsCard({ teams }: TeamAssignmentsCardProps) {
  return (
    <Card className="w-full shadow-none bg-white dark:bg-black border border-slate-200 dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600">
            <Users className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Team Assignments
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          {teams.map((team) => (
            <div
              key={team.role}
              className={[
                "flex flex-1 flex-col gap-3 rounded-lg p-4",
                team.backgroundColor ?? "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-slate-900 dark:text-slate-100">
                  {team.role}
                </span>

                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {team.members.length}
                </span>
              </div>

              {/* Team Members */}
              <AvatarGroup>
                {team.members.map((member) => (
                  <div className="relative group" key={member.id}>
                    <Avatar className="cursor-pointer border-2 border-white dark:border-slate-900">
                      <AvatarImage
                        src={member.avatar || placeholderImage}
                        alt={member.name}
                      />
                      <AvatarFallback className="capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {member.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform group-hover:block whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-slate-100 dark:text-slate-900 z-10">
                      {member.name}
                    </div>
                  </div>
                ))}
              </AvatarGroup>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
