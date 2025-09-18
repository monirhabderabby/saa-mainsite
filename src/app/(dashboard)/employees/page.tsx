import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MotionProvider from "@/providers/animation/motion-provider";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import EmployeementServerFetch from "./_components/employeement-server-fetch";

function CardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
        <CardDescription>
          Browse and search for employees by their ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[252px] w-full rounded-2xl animate-pulse bg-muted" />
      </CardContent>
    </Card>
  );
}

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user) redirect("/login");
  return (
    <div className="bg-white h-full">
      <Suspense fallback={<CardSkeleton />}>
        <MotionProvider>
          <EmployeementServerFetch curentUserRole={cu.user.role} />
        </MotionProvider>
      </Suspense>
    </div>
  );
};

export default Page;
