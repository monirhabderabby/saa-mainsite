import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Calendar, ChevronRight, User } from "lucide-react";
import moment from "moment";
import { redirect } from "next/navigation";
import StationActions from "./_components/station-actions";
import StationHeaderAction from "./_components/station-header-action";
const allowedEdit = ["ADMIN", "SALES_MEMBER", "SUPER_ADMIN"] as Role[];

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.role) redirect("/login");

  const stations = await prisma.stationUpdate.findMany({
    include: {
      assignments: {
        include: {
          user: true,
          profiles: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  });

  const isActionAccess = allowedEdit.includes(cu.user.role);

  const getShiftBadgeVariant = (shift: string) => {
    switch (shift) {
      case "morning":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border border-amber-200";
      case "day":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-200";
      case "night":
        return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border border-indigo-200";
      default:
        return "secondary";
    }
  };

  const formatShift = (shift: string) => {
    return shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  return (
    <main className="flex-1">
      <div className="flex bg-transparent border-none shadow-none justify-between items-center w-full">
        <div>
          <CardTitle>Entries</CardTitle>
          <CardDescription>
            All update entries in one place — apply filters to quickly find what
            you need.
          </CardDescription>
        </div>
        {isActionAccess && <StationHeaderAction />}
      </div>

      <div className="mt-5 grid gap-5">
        {stations.map((station) => (
          <Card
            className="border-2 hover:shadow-lg transition-all hover:border-primary/20"
            key={station.id}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-bold">
                      {station.title}
                    </CardTitle>
                    <Badge className={getShiftBadgeVariant(station.shift)}>
                      {formatShift(station.shift)} Shift
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {moment(station.createdAt).format("MMM DD, YYYY h:mm A")}
                    </span>
                  </div>
                </div>

                {isActionAccess && <StationActions stationId={station.id} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {station.assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-muted bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                        <User className="h-4 w-4 text-emerald-700" />
                      </div>
                      <span className="font-semibold text-foreground">
                        {assignment.user.fullName}
                      </span>
                    </div>
                    <div className="ml-10 space-y-1.5">
                      {assignment.profiles.map((profile, profileIndex) => (
                        <div
                          key={profileIndex}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <ChevronRight className="h-3 w-3" />
                          <span className="font-medium">
                            {profile.profile.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Page;
