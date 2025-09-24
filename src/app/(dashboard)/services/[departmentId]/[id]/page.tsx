import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app this would come from API
const serviceData = {
  1: {
    id: 1,
    name: "Mobile App",
    description:
      "Cross-platform mobile application development and maintenance",
    status: "Active",
    created: "2024-01-15",
    lastUpdated: "2024-03-10",
    teams: [
      {
        name: "Dart Layer",
        members: [
          {
            id: 1,
            name: "Alice Chen",
            avatar: "AC",
            role: "Team Lead",
            status: "online",
          },
          {
            id: 2,
            name: "Bob Wilson",
            avatar: "BW",
            role: "Developer",
            status: "away",
          },
          {
            id: 3,
            name: "Carol Davis",
            avatar: "CD",
            role: "Designer",
            status: "online",
          },
          {
            id: 4,
            name: "David Kim",
            avatar: "DK",
            role: "QA Engineer",
            status: "offline",
          },
        ],
        stats: { active: 8, completed: 24, pending: 3 },
      },
      {
        name: "Dev-X",
        members: [
          {
            id: 5,
            name: "Eva Rodriguez",
            avatar: "ER",
            role: "Senior Dev",
            status: "online",
          },
          {
            id: 6,
            name: "Frank Zhang",
            avatar: "FZ",
            role: "DevOps",
            status: "online",
          },
        ],
        stats: { active: 5, completed: 18, pending: 2 },
      },
      {
        name: "Elite Stack",
        members: [
          {
            id: 7,
            name: "Grace Liu",
            avatar: "GL",
            role: "Architect",
            status: "away",
          },
          {
            id: 8,
            name: "Henry Brown",
            avatar: "HB",
            role: "Backend Dev",
            status: "online",
          },
          {
            id: 9,
            name: "Iris Johnson",
            avatar: "IJ",
            role: "Frontend Dev",
            status: "online",
          },
        ],
        stats: { active: 12, completed: 31, pending: 1 },
      },
    ],
  },
};

export default function ServiceDetailsPage({}: {
  params: { serviceId: string };
}) {
  const service = serviceData[Number.parseInt("1") as keyof typeof serviceData];

  if (!service) {
    return <div>Service not found</div>;
  }

  const totalMembers = service.teams.reduce(
    (acc, team) => acc + team.members.length,
    0
  );
  const totalActive = service.teams.reduce(
    (acc, team) => acc + team.stats.active,
    0
  );
  const totalCompleted = service.teams.reduce(
    (acc, team) => acc + team.stats.completed,
    0
  );
  const totalPending = service.teams.reduce(
    (acc, team) => acc + team.stats.pending,
    0
  );
  const totalTasks = totalActive + totalCompleted + totalPending;
  const completionRate =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {service.name}
            </h1>
            <p className="text-slate-600 mt-1">{service.description}</p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={service.status === "Active" ? "default" : "secondary"}
            >
              {service.status}
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {completionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(service.created).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(service.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teams</p>
                <p className="font-medium">
                  {service.teams.length} active teams
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Overall Progress
                </p>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCompleted} of {totalTasks} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Teams Detail */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {service.teams.map((team, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-medium">
                          {team.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {team.members.length} members
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-orange-600">
                          {team.stats.active} active
                        </span>
                        <span className="text-green-600">
                          {team.stats.completed} done
                        </span>
                        <span className="text-yellow-600">
                          {team.stats.pending} pending
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-slate-600 text-white font-medium">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                                member.status === "online"
                                  ? "bg-green-500"
                                  : member.status === "away"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
