import { auth } from "@/auth";
import AddIssueForm from "@/components/forms/issue-sheet/add-issue-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccessDeniedCard } from "@/components/ui/custom/access-denied-card";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

const Page = async ({ params }: { params: { id: string } }) => {
  const cu = await auth();
  if (!cu || !cu.user.id) redirect("/login");

  const cuPermission = await prisma.permissions.findFirst({
    where: {
      userId: cu.user.id,
      name: "ISSUE_SHEET",
    },
    select: {
      isIssueUpdatAllowed: true,
    },
  });

  const entry = await prisma.issueSheet.findUnique({
    where: { id: params.id },
  });

  const [profiles, services] = await prisma.$transaction([
    prisma.profile.findMany(),
    prisma.services.findMany(),
  ]);

  if (!entry) notFound();

  // ✅ Allow if user is the owner OR has an allowed role
  const canEdit =
    cu.user.id === entry.creatorId ||
    (cu.user.role && allowedRoles.includes(cu.user.role as Role)) ||
    cuPermission?.isIssueUpdatAllowed;

  if (!canEdit) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <AccessDeniedCard />;
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Edit Issue</CardTitle>
            <CardDescription className="max-w-[500px] mt-2">
              Update the details of this issue. Make sure to provide clear
              information so the operations team can effectively review and
              resolve the issue.
            </CardDescription>
          </div>
          <Button variant="link" effect="hoverUnderline" asChild>
            <Link href="/update-sheet">
              <MoveLeft /> Back to the sheet
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AddIssueForm
          profiles={profiles}
          initianData={entry}
          services={services}
        />
      </CardContent>
    </Card>
  );
};

export default Page;
