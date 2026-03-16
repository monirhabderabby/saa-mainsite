import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { PackageCheck } from "lucide-react";

const SpecialSalesDeliveryInQue = async () => {
  const deliveryInQue = await prisma.updateSheet.count({
    where: {
      doneById: null,
      updateTo: "SPECIAL_ORDER_DELIVERY",
    },
  });
  return (
    <StatsCard
      title="Special Sales Delivery Queue"
      value={deliveryInQue}
      subtitle="Special orders awaiting delivery"
      icon={<PackageCheck className="h-4 w-4 text-emerald-500" />}
      trend={{ value: 5.3, isPositive: false }}
      valueClassName="text-emerald-500"
    />
  );
};

export default SpecialSalesDeliveryInQue;
