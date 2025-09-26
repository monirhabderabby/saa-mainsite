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
import { Role } from "@prisma/client";
import { MoveLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
const AccessDeniedCard = dynamic(
  () => import("@/components/ui/custom/access-denied-card"),
  {
    ssr: false,
  }
);

const AddUpdateForm = dynamic(
  () => import("@/components/forms/update-sheet/add-update-form"),
  { ssr: false }
);

const Page = async ({ params }: { params: { id: string } }) => {
  const cu = await auth();
  if (!cu?.user.id) redirect("/login");

  // Step 1: Fetch entry + creator's teams + service
  const entry = await prisma.updateSheet.findUnique({
    where: { id: params.id },
    include: {
      updateBy: {
        select: {
          id: true,
          service: {
            select: {
              serviceManagerId: true,
            },
          },
          userTeams: {
            select: {
              teamId: true,
              responsibility: true,
            },
          },
        },
      },
    },
  });

  if (!entry) notFound();

  // Step 2: Fetch current user's teams + role
  const currentUser = await prisma.user.findUnique({
    where: { id: cu.user.id },
    select: {
      role: true,
      userTeams: { select: { teamId: true, responsibility: true } },
    },
  });

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <AccessDeniedCard message="User not found." />
      </div>
    );
  }

  // Step 3: Check if user is leader of the same team as entry creator
  const creatorTeamIds = entry.updateBy?.userTeams.map((t) => t.teamId) ?? [];
  const isSameTeamLeader = currentUser.userTeams.some(
    (ut) => creatorTeamIds.includes(ut.teamId) && ut.responsibility === "Leader"
  );

  // Step 4: Check if current user is service manager of entry creator's service
  const isServiceManager =
    entry.updateBy?.service?.serviceManagerId === cu.user.id;

  // Step 5: Check if user is admin/super admin
  const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];
  const isAdmin = cu.user.role && allowedRoles.includes(cu.user.role as Role);

  // Step 6: Combine access rules
  const canEdit =
    cu.user.id === entry.updateById ||
    isAdmin ||
    isServiceManager ||
    isSameTeamLeader;

  if (!canEdit) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <AccessDeniedCard />
      </div>
    );
  }

  // Step 5: Fetch profiles only if user can edit
  const profiles = await prisma.profile.findMany();

  return (
    <Card className="dark:bg-white/5">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Edit Entry</CardTitle>
            <CardDescription className="max-w-[500px] mt-2">
              Use this form to edit an existing sheet entry. Select a profile
              and provide the necessary details to keep the update sheet current
              and accurate.
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
        <AddUpdateForm profiles={profiles} initialData={entry} />
      </CardContent>
    </Card>
  );
};

export default Page;
