import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Edit } from "lucide-react";
import { redirect } from "next/navigation";

const roleLabels: Record<Role, string> = {
  [Role.OPERATION_MEMBER]: "OPERATION",
  [Role.SALES_MEMBER]: "SALES",
  [Role.SUPER_ADMIN]: "SUPER ADMIN",
  [Role.ADMIN]: "ADMIN",
};

export default async function UserProfileCard() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: {
      id: cu.user.id,
    },
    include: {
      userTeams: {
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const team = user.userTeams.length > 0 ? user.userTeams[0] : null;
  return (
    <Card className="w-full max-w-sm h-full overflow-hidden bg-white shadow-lg">
      {/* Header with curved green background */}
      <div className="h-32 bg-gradient-to-br from-green-300 to-green-400 relative">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage
                src="/placeholder.avif"
                alt={user.fullName as string}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold bg-gray-200">
                JS
              </AvatarFallback>
            </Avatar>
            {/* Edit button */}
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 shadow-lg p-0"
            >
              <Edit className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-8 px-6 text-center">
        {/* Name and Role */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {user.fullName}
        </h1>
        <p className="text-gray-500 text-sm mb-8">{roleLabels[user.role]}</p>

        {/* User Details */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium min-w-[80px]">ID:</span>
            <span className="text-gray-900">{user.employeeId}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium min-w-[80px]">
              Name:
            </span>
            <span className="text-gray-900">{user.fullName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium min-w-[80px]">
              Email:
            </span>
            <span className="text-gray-900 break-all">{user.email}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium min-w-[80px]">
              Team Name:
            </span>
            <span className="text-gray-900">
              {team?.team?.name ?? "No team assigned"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
