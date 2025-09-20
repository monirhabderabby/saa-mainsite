import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import IssueOpenStatus from "./isse-open-stats";
import IssueDoneStats from "./issue-done-stats";
import WipStats from "./wip-stats";

interface Props {
  teamId: string;
  teamName: string;
}

function CardSkeleton({ className }: { className: string }) {
  return <Skeleton className={cn(className, " h-[100px]")} />;
}

const ProjectManagerOverviewTeam = async ({ teamId, teamName }: Props) => {
  return (
    <Card className="shadow-none dark:bg-slate-50/5">
      <CardHeader>
        <CardTitle>{teamName}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Suspense fallback={<CardSkeleton className="bg-red-500/10" />}>
            <IssueOpenStatus teamId={teamId} />
          </Suspense>
          <Suspense
            fallback={<CardSkeleton className="bg-primary-yellow/10" />}
          >
            <WipStats teamId={teamId} />
          </Suspense>

          <Suspense fallback={<CardSkeleton className="bg-primary-green/10" />}>
            <IssueDoneStats teamId={teamId} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectManagerOverviewTeam;
