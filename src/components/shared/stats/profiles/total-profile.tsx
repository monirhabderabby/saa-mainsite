import StatsCard from "@/components/shared/cards/stats-card";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";

const TotalProfile = async () => {
  const totalProfile = await prisma.profile.count();

  return (
    <StatsCard
      title="Total Profiles"
      value={totalProfile}
      subtitle="Active profiles for business"
      icon={<Users className="h-4 w-4 text-muted-foreground " />}
      trend={{ value: 5.3, isPositive: false }}
      valueClassName="dark:text-white text-black"
    />
  );
};

export default TotalProfile;
