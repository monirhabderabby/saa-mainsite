const AddUpdateForm = dynamic(
  () => import("@/components/forms/update-sheet/add-update-form"),
  {
    ssr: false,
  }
);
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
import dynamic from "next/dynamic";
import Link from "next/link";

const Page = async () => {
  const profiles = await prisma.profile.findMany();
  return (
    <div className="pb-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Add Entry</CardTitle>
              <CardDescription className="max-w-[500px] mt-2">
                Use this form to create a new update sheet entry. Select a
                profile and provide the necessary details to keep the update
                sheet current and accurate.
              </CardDescription>
            </div>
            <Button variant="link" effect="hoverUnderline" asChild>
              <Link href="/update-sheet">
                <MoveLeft /> Back to Sheet
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AddUpdateForm profiles={profiles} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
