import StatsCard from "@/components/shared/cards/stats-card";
import { Database, FileText, Truck, Upload } from "lucide-react";
import { Suspense } from "react";
import IssuesDoneToday from "./_components/issue-done-today";
import IssuesOpen from "./_components/issue-open";
import IssuesWip from "./_components/issue-wip";
import TotalEmployees from "./_components/total-employees";

function CardSkeleton() {
  return (
    <div className="h-[152px] w-full rounded-2xl animate-pulse bg-muted" />
  );
}

const SuperAdminOverViewContainer = async () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <StatsCard
            title="Updates in Queue"
            value="42"
            subtitle="Pending deployment"
            icon={<Upload className="h-4 w-4 text-primary-yellow" />}
            trend={{ value: -8.1, isPositive: true }}
          />

          <StatsCard
            title="Delivery in Queue"
            value="18"
            subtitle="Ready for delivery"
            icon={<Truck className="h-4 w-4 text-primary-yellow" />}
            trend={{ value: 15.7, isPositive: true }}
          />

          {/* Storage Analytics */}
          <StatsCard
            title="Update Sheet Storage"
            value="2.4 GB"
            subtitle="Database size"
            icon={<Database className="h-4 w-4 text-primary-yellow" />}
            trend={{ value: 12.3, isPositive: false }}
          />

          <StatsCard
            title="Issue Sheet Storage"
            value="1.8 GB"
            subtitle="Database size"
            icon={<FileText className="h-4 w-4 text-primary-yellow" />}
            trend={{ value: 7.9, isPositive: false }}
          />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminOverViewContainer;
