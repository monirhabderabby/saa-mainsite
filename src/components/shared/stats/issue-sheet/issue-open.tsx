import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  redirectTo?: string;
}

const IssuesOpen = async ({ redirectTo }: Props) => {
  const totalIssueOpen = await prisma.issueSheet.count({
    where: { status: "open" },
  });
  return (
    <Link href={redirectTo ?? "/"}>
      <StatsCard
        title="Issues Open"
        value={totalIssueOpen}
        subtitle="Pending resolution"
        icon={<AlertCircle className="h-4 w-4 text-[#F4A162]" />}
        trend={{ value: -12.5, isPositive: true }}
        valueClassName="text-[#F4A162]"
      />
    </Link>
  );
};

export default IssuesOpen;
