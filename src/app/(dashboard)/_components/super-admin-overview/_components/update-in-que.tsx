import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Clock } from "lucide-react";

const UpdateInQue = async () => {
  const updateInQue = await prisma.updateSheet.count({
    where: {
      tlId: {
        not: null,
      },
      doneById: null,
    },
  });
  return (
    <StatsCard
      title="Updates in Queue"
      value={updateInQue}
      subtitle="Messages awaiting for sending"
      icon={<Clock className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: 5.3, isPositive: false }}
    />
  );
};

export default UpdateInQue;
