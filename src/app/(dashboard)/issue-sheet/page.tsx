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
import IssueTableContainer from "./_components/table-container";
const AddFilterIssueSheetEntries = dynamic(
  () => import("./_components/filter/add-filter-issue-sheet-entries"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu?.user || !cu.user.id) redirect("/login");

  const [profiles, teams] = await prisma.$transaction([
    prisma.profile.findMany(),
    prisma.team.findMany(),
  ]);

  const permission = await prisma.permissions.findFirst({
    where: {
      userId: cu.user.id,
      name: "ISSUE_SHEET",
    },
    select: {
      isIssueCreateAllowed: true,
    },
  });

  const isWriteAccess = permission?.isIssueCreateAllowed ?? false;
  return (
    <Card className="shadow-none ">
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
            <AddFilterIssueSheetEntries
              profiles={profiles}
              teams={teams}
              trigger={
                <Button variant="outline">
                  <Filter /> Filter
                </Button>
              }
            />
            {isWriteAccess && (
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
        <IssueTableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
