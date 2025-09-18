import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { CheckCircle2 } from "lucide-react";

const IssuesDoneToday = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const totalIssueDoneToday = await prisma.issueSheet.count({
    where: {
      status: "done",
      statusChangedAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  return (
    <StatsCard
      title="Issues Done Today"
      value={totalIssueDoneToday}
      subtitle="Completed today"
      icon={<CheckCircle2 className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: 25.0, isPositive: true }}
    />
  );
};

export default IssuesDoneToday;
