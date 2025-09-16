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
            <CardTitle>Raise a New Issue</CardTitle>
            <CardDescription className="max-w-[500px] mt-2">
              Use this form to report a new issue from the sales side. Provide
              clear details so the operations team can review, take action, and
              resolve the issue efficiently.
            </CardDescription>
          </div>
          <Button variant="link" effect="hoverUnderline" asChild>
            <Link href="/update-sheet">
              <MoveLeft /> Back to Issue Sheet
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
