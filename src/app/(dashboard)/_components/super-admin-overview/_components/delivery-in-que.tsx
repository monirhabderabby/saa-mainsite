import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Clock } from "lucide-react";

const DeliveryInQue = async () => {
  const deliveryInQue = await prisma.updateSheet.count({
    where: {
      tlId: {
        not: null,
      },
      doneById: null,
      updateTo: "DELIVERY",
    },
  });
  return (
    <StatsCard
      title="Delivery in Queue"
      value={deliveryInQue}
      subtitle="Messages awaiting for delivery"
      icon={<Clock className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: 5.3, isPositive: false }}
    />
  );
};

export default DeliveryInQue;
