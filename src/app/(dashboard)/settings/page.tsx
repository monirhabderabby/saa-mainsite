import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MotionProvider from "@/providers/animation/motion-provider";
import { Suspense } from "react";
import DatabaseManagement from "./_components/database-management/database-management";

function CardSkeleton() {
  return <Skeleton className="bg-slate-400/10 h-[170px]" />;
}

const Page = () => {
  return (
    <MotionProvider>
      <Card className="dark:bg-white/5">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage SAA Application settings and database operations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<CardSkeleton />}>
            <DatabaseManagement />
          </Suspense>
        </CardContent>
      </Card>
    </MotionProvider>
  );
};

export default Page;
