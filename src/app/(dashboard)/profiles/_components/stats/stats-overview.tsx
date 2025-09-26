import IssuesOpen from "@/components/shared/stats/issue-sheet/issue-open";
import IssuesWip from "@/components/shared/stats/issue-sheet/issue-wip";
import TotalProfile from "@/components/shared/stats/profiles/total-profile";
import DeliveryInQue from "@/components/shared/stats/update-sheet/delivery-in-que";
import UpdateInQue from "@/components/shared/stats/update-sheet/update-in-que";
import { Suspense } from "react";

function CardSkeleton() {
  return (
    <div className="h-[152px] w-full rounded-2xl shadow animate-pulse bg-white dark:bg-white/10 border-border" />
  );
}

const ProfileStatsoverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <Suspense fallback={<CardSkeleton />}>
        <TotalProfile />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <DeliveryInQue />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <UpdateInQue />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <IssuesOpen />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <IssuesWip />
      </Suspense>
    </div>
  );
};

export default ProfileStatsoverview;
