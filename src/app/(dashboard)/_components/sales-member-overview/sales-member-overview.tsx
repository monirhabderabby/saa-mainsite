import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TotalDeliveryInQue from "./cards/total-delivery-inque";
import TotalUpdateInQue from "./cards/total-update-in-que";

function CardSkeleton() {
  return (
    <div className="h-[152px] w-full rounded-2xl animate-pulse bg-muted" />
  );
}

const SalesMemberOverview = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  return (
    <div className="grid grid-cols-2 gap-10">
      <Suspense fallback={<CardSkeleton />}>
        <TotalUpdateInQue />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <TotalDeliveryInQue />
      </Suspense>
    </div>
  );
};

export default SalesMemberOverview;
