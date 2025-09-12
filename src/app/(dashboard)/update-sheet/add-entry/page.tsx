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

const Page = async () => {
  const profiles = await prisma.profile.findMany();
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Add Entry</CardTitle>
            <CardDescription className="max-w-[500px] mt-2">
              Use this form to create a new update sheet entry. Select a profile
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
        <AddUpdateForm profiles={profiles} />
      </CardContent>
    </Card>
  );
};

export default Page;
