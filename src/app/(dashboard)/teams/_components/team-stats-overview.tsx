import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users } from "lucide-react";

interface StatsOverviewProps {
  totalServices: number;
  totalTeams: number;
  totalMembers: number;
}

export default function TeamStatsOverview({
  totalServices,
  totalTeams,
  totalMembers,
}: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Teams",
      value: totalTeams,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Team Members",
      value: totalMembers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-md shadow-none transition-shadow"
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
