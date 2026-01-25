import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Image from "next/image";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface TeamSection {
  role: string; // Role name
  members: TeamMember[];
  backgroundColor?: string;
}

interface TeamAssignmentsCardProps {
  teams: TeamSection[];
}

export function TeamAssignmentsCard({ teams }: TeamAssignmentsCardProps) {
  return (
    <Card className="w-full shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600">
            <Users className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Team Assignments
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          {teams.map((team) => (
            <div
              key={team.role}
              className={`flex flex-1 flex-col gap-3 rounded-lg p-4 ${team.backgroundColor || "bg-gray-100"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[14px] text-gray-900">
                  {team.role}
                </span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
                  {team.members.length}
                </span>
              </div>

              {/* Team Members */}
              <div className="flex items-center gap-2 relative">
                {team.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="relative group"
                    style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                  >
                    <Image
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover cursor-pointer"
                      height={40}
                      width={40}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      {member.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
