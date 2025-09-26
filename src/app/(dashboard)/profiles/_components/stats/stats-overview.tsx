import DeliveryInQue from "@/app/(dashboard)/_components/super-admin-overview/_components/delivery-in-que";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Wrench } from "lucide-react";
import { Suspense } from "react";
import TotalProfile from "./total-profile";

function CardSkeleton() {
  return (
    <div className="h-[152px] w-full rounded-2xl shadow animate-pulse bg-white border-border" />
  );
}

const ProfileStatsoverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <Suspense fallback={<CardSkeleton />}>
        <TotalProfile />
      </Suspense>

      <DeliveryInQue />

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Update Queue
          </CardTitle>
          <Wrench className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-2">{62}</div>
          <p className="text-xs text-muted-foreground">Pending updates</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Issues Open
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-chart-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-5">{585}</div>
          <p className="text-xs text-muted-foreground">Open issues</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Issues WIP
          </CardTitle>
          <Wrench className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-3">{365}</div>
          <p className="text-xs text-muted-foreground">Work in progress</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStatsoverview;
