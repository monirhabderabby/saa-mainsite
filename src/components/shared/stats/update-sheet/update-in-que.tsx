import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Wrench } from "lucide-react";

const UpdateInQue = async () => {
  const updateInQue = await prisma.updateSheet.count({
    where: {
      tlId: {
        not: null,
      },
      doneById: null,
      updateTo: {
        not: "DELIVERY",
      },
    },
  });

  return (
    <StatsCard
      title="Update Queue"
      value={updateInQue}
      subtitle="Pending updates"
      icon={<Wrench className="h-4 w-4 text-chart-2" />}
      trend={{ value: 5.3, isPositive: false }}
      valueClassName="text-chart-2"
    />
  );
};

export default UpdateInQue;
