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
    const shiftLabels: Record<string, string> = {
      morning: "Morning",
      day: "Evening",
      night: "Night",
    };

    return shiftLabels[shift] ?? shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  return (
    <main className="flex-1 p-5 md:p-0">
      <div className="flex flex-col md:flex-row bg-transparent border-none shadow-none justify-between items-start md:items-center w-full gap-y-5">
        <div>
          <CardTitle>Entries</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            All update entries in one place — apply filters to quickly find what
            you need.
          </CardDescription>
        </div>
        {isActionAccess && (
          <StationHeaderAction isStationAvailable={Boolean(stations.length)} />
        )}
      </div>

      <div className="mt-5 grid gap-5 ">
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
                      {moment(station.createdAt)
                        .utcOffset("+06:00")
                        .format("MMM DD, YYYY h:mm A")}
                    </span>
                  </div>
                </div>

                {isActionAccess && <StationActions stationId={station.id} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="items-start grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {station.assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-muted bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                          <User className="h-4 w-4 text-emerald-700" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {assignment.user.fullName}
                        </span>
                      </div>

                      {assignment.user.phone && (
                        <span>
                          <a
                            href={`https://wa.me/${assignment.user.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center text-green-500 hover:text-green-600 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.534 5.874L.057 23.857a.5.5 0 0 0 .614.614l6.063-1.46A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.882 9.882 0 0 1-5.031-1.37l-.36-.214-3.733.9.934-3.617-.235-.374A9.86 9.86 0 0 1 2.1 12c0-5.461 4.439-9.9 9.9-9.9 5.462 0 9.9 4.439 9.9 9.9 0 5.462-4.438 9.9-9.9 9.9z" />
                            </svg>
                          </a>
                        </span>
                      )}
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
