import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { MessageSquareWarning } from "lucide-react";
import Link from "next/link";

interface Props {
  redirectTo?: string;
}

const ComplaintsOpen = async ({ redirectTo }: Props) => {
  const totalComplaintsOpen = await prisma.complaint.count({
    where: {
      status: {
        in: ["OPEN"],
      },
    },
  });

  return (
    <Link href={redirectTo ?? "/"}>
      <StatsCard
        title="Complaints Open"
        value={totalComplaintsOpen}
        subtitle="Pending resolution"
        icon={<MessageSquareWarning className="h-4 w-4 text-[#E05C5C]" />}
        trend={{ value: -5.0, isPositive: true }}
        valueClassName="text-[#E05C5C]"
      />
    </Link>
  );
};

export default ComplaintsOpen;
