import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Clock } from "lucide-react";
import Link from "next/link";

interface Props {
  redirectTo?: string;
}

const IssuesWip = async ({ redirectTo }: Props) => {
  const totalIssueWip = await prisma.issueSheet.count({
    where: { status: "wip" },
  });
  return (
    <Link href={redirectTo ?? "/"}>
      <StatsCard
        title="Issues WIP"
        value={totalIssueWip}
        subtitle="Work in progress"
        icon={<Clock className="h-4 w-4 text-primary-yellow" />}
        trend={{ value: 5.3, isPositive: false }}
        valueClassName="text-primary-yellow"
      />
    </Link>
  );
};

export default IssuesWip;
