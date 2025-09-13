import AddUpdateForm from "@/components/forms/update-sheet/add-update-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  const profiles = await prisma.profile.findMany();
  const entry = await prisma.updateSheet.findUnique({
    where: { id: params.id },
  });

  if (!entry) notFound();
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
