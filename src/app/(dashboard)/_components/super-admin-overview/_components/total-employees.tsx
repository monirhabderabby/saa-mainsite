import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";

const TotalEmployees = async () => {
  const totalEmployee = await prisma.user.count();
  return (
    <StatsCard
      title="Total Employees"
      value={totalEmployee}
      subtitle="Total team members"
      icon={<Users className="h-4 w-4 text-primary-yellow" />}
      trend={{ value: 8.2, isPositive: true }}
    />
  );
};

export default TotalEmployees;
