import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";

// Dynamic imports for components
const IssueTableContainer = dynamic(
  () => import("./_components/table-container"),
  {
    ssr: false,
  }
);

const AddFilterIssueSheetEntries = dynamic(
  () => import("./_components/filter/add-filter-issue-sheet-entries"),
  {
    ssr: false,
  }
);

const Page = async () => {
  // Authenticated user data
  const currentUserSession = await auth();
  if (!currentUserSession || !currentUserSession?.user?.id) {
    redirect("/login");
  }

  // Fetch required data for profiles, teams, and services
  const [profiles, services, teams] = await prisma.$transaction([
    prisma.profile.findMany(),

    prisma.services.findMany({
      where: {
        department: {
          is: {
            name: "Operation",
          },
        },
        name: {
          not: "Management",
        },
      },
    }),

    prisma.team.findMany({
      where: {
        service: {
          department: {
            is: {
              name: "Operation",
            },
          },
          name: {
            not: "Management",
          },
        },
      },
    }),
  ]);

  // Check if the user has permission to create issues
  const permission = await prisma.permissions.findFirst({
    where: {
      userId: currentUserSession.user.id,
      name: "ISSUE_SHEET",
    },
    select: {
      isIssueCreateAllowed: true,
      isIssueUpdatAllowed: true,
    },
  });

  const canCreateIssues = permission?.isIssueCreateAllowed ?? false;

  // Fetch current user's details and associated teams
  const currentUserDetails = await prisma.user.findUnique({
    where: {
      id: currentUserSession.user.id,
    },
    select: {
      serviceId: true,
      service: {
        select: {
          name: true,
        },
      },
      userTeams: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!currentUserDetails) {
    redirect("/login");
  }

  // Determine if the current user belongs to management or sales roles
  const isManagement = currentUserDetails.service?.name === "Management";
  const isSalesPerson = currentUserSession.user.role === "SALES_MEMBER";

  // Get the user's associated team (if any)
  const userTeams = currentUserDetails.userTeams;
  const userTeam = (userTeams.length > 0 && userTeams[0]) || undefined;
  const isTeamLeader =
    (userTeam?.userId === currentUserSession.user.id &&
      userTeam.responsibility === "Leader") ||
    userTeam?.responsibility === "Coleader";

  // Check if default filters should be ignored
  const shouldIgnoreDefaultFilters = isManagement || isSalesPerson;

  // can edit
  const canEdit = permission?.isIssueUpdatAllowed ?? false;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle>Issue Sheet</CardTitle>
            <CardDescription className="max-w-[600px] mt-2">
              Track all issues raised by the sales team and their resolution
              progress by the operations team. Apply filters to quickly find
              open, in-progress, or resolved issues.
            </CardDescription>
          </div>
          <div className="flex items-center gap-5">
            {/* Filter Component */}
            <AddFilterIssueSheetEntries
              currentUserServiceId={
                shouldIgnoreDefaultFilters
                  ? undefined
                  : (currentUserDetails?.serviceId ?? "")
              }
              currentUserTeamId={
                shouldIgnoreDefaultFilters
                  ? undefined
                  : isTeamLeader
                    ? undefined
                    : userTeam?.teamId
              }
              profiles={profiles}
              services={services}
              teams={teams}
              trigger={
                <Button variant="outline">
                  <Filter /> Filter
                </Button>
              }
            />
            {/* Add Issue Button */}
            {canCreateIssues && (
              <Button effect="gooeyLeft" asChild>
                <Link href="/issue-sheet/add-entry" className="w-full">
                  Add Issue
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <IssueTableContainer
          currentUserRole={currentUserSession.user.role}
          canEdit={canEdit}
        />
      </CardContent>
    </Card>
  );
};

export default Page;
