import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Clock } from "lucide-react";

const IssuesWip = async () => {
  const totalIssueWip = await prisma.issueSheet.count({
    where: { status: "wip" },
  });
  return (
    <StatsCard
      title="Issues WIP"
      value={totalIssueWip}
      subtitle="Work in progress"
      icon={<Clock className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: 5.3, isPositive: false }}
    />
  );
};

export default IssuesWip;
