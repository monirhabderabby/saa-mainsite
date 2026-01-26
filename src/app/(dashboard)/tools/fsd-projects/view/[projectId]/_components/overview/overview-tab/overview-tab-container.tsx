import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Clock, Info } from "lucide-react";
import moment from "moment";
import { TeamAssignmentsCard } from "../../cards/team-assigned-card";

interface Props {
  data: SafeProjectDto;
}

const OverviewTabContainer = async ({ data }: Props) => {
  const project = await prisma.project.findUnique({
    where: { id: data.id },
    include: {
      projectAssignments: {
        include: { user: true },
      },
    },
  });

  const uiuxMembers =
    project?.projectAssignments.filter((a) => a.role === "UIUX") ?? [];

  const frontendMembers =
    project?.projectAssignments.filter((a) => a.role === "FRONTEND") ?? [];

  const backendMembers =
    project?.projectAssignments.filter((a) => a.role === "BACKEND") ?? [];

  const groupedAssignments = [
    {
      role: "UI/UX Designers",
      members: uiuxMembers.map((a) => ({
        id: a.userId,
        name: a.user.fullName,
        avatar: a.user.image || "/placeholder.svg",
      })),
      backgroundColor: "bg-pink-100",
    },
    {
      role: "Frontend Devs",
      members: frontendMembers.map((a) => ({
        id: a.userId,
        name: a.user.fullName,
        avatar: a.user.image || "/placeholder.svg",
      })),
      backgroundColor: "bg-blue-100",
    },
    {
      role: "Backend Devs",
      members: backendMembers.map((a) => ({
        id: a.userId,
        name: a.user.fullName,
        avatar: a.user.image || "/placeholder.svg",
      })),
      backgroundColor: "bg-green-100",
    },
  ];

  // Only include teams with at least 1 member
  const nonEmptyTeams = groupedAssignments.filter(
    (team) => team.members.length > 0,
  );

  return (
    <div className="space-y-5">
      {/* Project Info & Timeline Cards (same as your code) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project Info Card */}
        <Card className="w-full shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                <Info className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-md font-medium">
                Project Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Client Name</p>
              <p className="font-medium">{data.clientName}</p>
            </div>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Order Date</p>
              <p className="font-medium">
                {moment(data.orderDate).format("MMM DD, YYYY")}
              </p>
            </div>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Deadline</p>
              <p className="font-medium">
                {moment(data.deadline).format("MMM DD, YYYY")}
              </p>
            </div>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Shift</p>
              <p className="font-medium">
                {data.shift?.charAt(0).toUpperCase() + data.shift?.slice(1)}
              </p>
            </div>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Value</p>
              <p className="font-medium">${data.value}</p>
            </div>
            <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
              <p>Monetary Value</p>
              <p className="font-medium">${data.monetaryValue}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Updates Card */}
        <Card className="w-full shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-md font-medium">
                Timeline & Updates
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.lastUpdate && (
              <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
                <p>Last Update</p>
                <p className="font-medium">
                  {moment(data.lastUpdate).format("MMM DD, YYYY HH:mm")}
                </p>
              </div>
            )}
            {data.nextUpdate && (
              <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
                <p>Next Update</p>
                <p className="font-medium">
                  {moment(data.nextUpdate).format("MMM DD, YYYY HH:mm")}
                </p>
              </div>
            )}
            {data.delivered && (
              <div className="px-3 py-2 border-b border-border flex justify-between text-[13px]">
                <p>Delivered</p>
                <p className="font-medium">
                  {moment(data.delivered).format("MMM DD, YYYY HH:mm")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Assignments */}
      {nonEmptyTeams.length > 0 && (
        <TeamAssignmentsCard teams={nonEmptyTeams} />
      )}
      <TeamAssignmentsCard teams={groupedAssignments} />
    </div>
  );
};

export default OverviewTabContainer;
