import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { ArrowLeftIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
const SupportFilterCodntainer = dynamic(
  () => import("./_components/filter-container"),
  {
    ssr: false,
  },
);
const SupportPeriodTableContainer = dynamic(
  () => import("./_components/support-period-table-container"),
  {
    ssr: false,
  },
);

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const team = await prisma.userTeam.findFirst({
    where: {
      userId: cu.user.id,
    },
    select: {
      teamId: true,
    },
  });

  const allTeams = await prisma.team.findMany({
    where: {
      service: {
        name: "FSD",
      },
    },
  });

  const teamsOptions = allTeams.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="font-medium">Support Period</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your projects
            </p>
          </div>
          <div className="flex items-center gap-x-3">
            <SupportFilterCodntainer
              teams={teamsOptions}
              cuTeamId={team?.teamId}
            />
            <Button variant="outline" size="sm" asChild>
              <Link href="/tools/fsd-projects">
                <ArrowLeftIcon />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <SupportPeriodTableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
