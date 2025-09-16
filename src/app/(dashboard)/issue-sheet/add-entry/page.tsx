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
const AddIssueForm = dynamic(
  () => import("@/components/forms/issue-sheet/add-issue-form"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const [profiles, services] = await prisma.$transaction([
    prisma.profile.findMany(),
    prisma.services.findMany(), // Note: fixed from 'services' to 'service'
  ]);
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
            <Link href="/issue-sheet">
              <MoveLeft /> Back to Issue Sheet
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AddIssueForm profiles={profiles} services={services} />
      </CardContent>
    </Card>
  );
};

export default Page;
