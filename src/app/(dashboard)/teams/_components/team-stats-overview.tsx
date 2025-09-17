import { Card, CardContent } from "@/components/ui/card";
import { ServiceStats } from "@/types/services";
import { Briefcase, Users } from "lucide-react";

interface StatsOverviewProps {
  stats: ServiceStats;
}

export default function TeamStatsOverview({ stats }: StatsOverviewProps) {
  const statsConfig = [
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Teams",
      value: stats.totalTeams,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Employees",
      value: stats.totalMembers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {statsConfig.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-md transition-shadow dark:bg-white/5"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
