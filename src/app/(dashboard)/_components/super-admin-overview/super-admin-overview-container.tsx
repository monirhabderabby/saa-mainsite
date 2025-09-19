import { Suspense } from "react";
import DeliveryInQue from "./_components/delivery-in-que";
import IssuesDoneToday from "./_components/issue-done-today";
import IssuesOpen from "./_components/issue-open";
import IssuesWip from "./_components/issue-wip";
import TotalEmployees from "./_components/total-employees";
import UpdateInQue from "./_components/update-in-que";

function CardSkeleton() {
  return (
    <div className="h-[152px] w-full rounded-2xl animate-pulse bg-muted" />
  );
}

const SuperAdminOverViewContainer = async () => {
  return (
    <div className="h-full ">
      <header className="border-b border-primary-yellow/50 dark:border-primary-yellow/10  ">
        <div className=" px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Overview
              </h1>
              <p className="text-[12px] text-muted-foreground mt-1">
                Monitor your business metrics and performance
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              All systems operational
            </div>
          </div>
        </div>
      </header>

      <main className="p-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* Employee Stats */}
          <Suspense fallback={<CardSkeleton />}>
            <TotalEmployees />
          </Suspense>

          {/* Issue Tracking */}
          <Suspense fallback={<CardSkeleton />}>
            <IssuesOpen />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <IssuesWip />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <IssuesDoneToday />
          </Suspense>

          {/* Queue Management */}
          <Suspense fallback={<CardSkeleton />}>
            <UpdateInQue />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <DeliveryInQue />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminOverViewContainer;
