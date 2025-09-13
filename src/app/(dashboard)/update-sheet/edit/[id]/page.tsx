import { auth } from "@/auth";
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
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
const AddUpdateForm = dynamic(
  () => import("@/components/forms/update-sheet/add-update-form"),
  {
    ssr: false,
  }
);

const allowedRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

const Page = async ({ params }: { params: { id: string } }) => {
  const cu = await auth();

  if (!cu?.user.id) redirect("/login");
  const profiles = await prisma.profile.findMany();
  const entry = await prisma.updateSheet.findUnique({
    where: { id: params.id },
  });

  if (!entry) notFound();

  // ✅ Allow if user is the owner OR has an allowed role
  const canEdit =
    cu.user.id === entry.updateById ||
    (cu.user.role && allowedRoles.includes(cu.user.role as Role));

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
            <CardTitle>Edit Entry</CardTitle>
            <CardDescription className="max-w-[500px] mt-2">
              Use this form to edit existing sheet entry. Select a profile and
              provide the necessary details to keep the update sheet current and
              accurate.
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
