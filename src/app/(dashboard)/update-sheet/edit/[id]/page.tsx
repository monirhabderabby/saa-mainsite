import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canEditUpdateSheetEntry } from "@/lib/permissions/update-sheet/update-entry";
import prisma from "@/lib/prisma";
import { MoveLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const AccessDeniedCard = dynamic(
  () => import("@/components/ui/custom/access-denied-card"),
  { ssr: false }
);

const AddUpdateForm = dynamic(
  () => import("@/components/forms/update-sheet/add-update-form"),
  { ssr: false }
);

const Page = async ({ params }: { params: { id: string } }) => {
  const cu = await auth();
  if (!cu?.user.id) redirect("/login");

  // Step 1: Ensure entry exists
  const entry = await prisma.updateSheet.findUnique({
    where: { id: params.id },
    include: {
      updateBy: {
        select: {
          id: true,
          serviceId: true,
          service: { select: { serviceManagerId: true } },
          userTeams: { select: { teamId: true, responsibility: true } },
        },
      },
    },
  });

  if (!entry) notFound();

  // Step 2: Centralized permission check
  const { canEdit, reason } = await canEditUpdateSheetEntry(
    cu.user.id,
    params.id
  );

  if (!canEdit) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <AccessDeniedCard message={reason} />
      </div>
    );
  }

  // Step 3: Fetch profiles only if user can edit
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
