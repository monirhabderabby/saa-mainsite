import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { AlertCircle } from "lucide-react";

const IssuesOpen = async () => {
  const totalIssueOpen = await prisma.issueSheet.count({
    where: { status: "open" },
  });
  return (
    <StatsCard
      title="Issues Open"
      value={totalIssueOpen}
      subtitle="Pending resolution"
      icon={<AlertCircle className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: -12.5, isPositive: true }}
    />
  );
};

export default IssuesOpen;
