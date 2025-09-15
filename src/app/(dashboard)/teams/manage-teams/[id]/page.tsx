import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app this would come from API based on serviceId
const serviceData = {
  id: 1,
  name: "Mobile App",
  teams: [
    {
      name: "Dart Layer",
      members: [
        {
          id: 1,
          name: "Alice Chen",
          avatar: "AC",
          role: "Tech Lead",
          status: "online",
        },
        {
          id: 2,
          name: "Bob Smith",
          avatar: "BS",
          role: "Senior Developer",
          status: "away",
        },
        {
          id: 3,
          name: "Carol Davis",
          avatar: "CD",
          role: "Developer",
          status: "online",
        },
        {
          id: 4,
          name: "David Wilson",
          avatar: "DW",
          role: "Developer",
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
          name: "Emma Johnson",
          avatar: "EJ",
          role: "DevOps Lead",
          status: "online",
        },
        {
          id: 6,
          name: "Frank Miller",
          avatar: "FM",
          role: "Platform Engineer",
          status: "online",
        },
        {
          id: 7,
          name: "Grace Lee",
          avatar: "GL",
          role: "Site Reliability Engineer",
          status: "away",
        },
      ],
      stats: { active: 5, completed: 18, pending: 2 },
    },
    {
      name: "Elite Stack",
      members: [
        {
          id: 8,
          name: "Henry Brown",
          avatar: "HB",
          role: "Full Stack Lead",
          status: "online",
        },
        {
          id: 9,
          name: "Ivy Taylor",
          avatar: "IT",
          role: "Frontend Developer",
          status: "online",
        },
        {
          id: 10,
          name: "Jack Anderson",
          avatar: "JA",
          role: "Backend Developer",
          status: "offline",
        },
        {
          id: 11,
          name: "Kate Wilson",
          avatar: "KW",
          role: "UI/UX Designer",
          status: "online",
        },
      ],
      stats: { active: 12, completed: 31, pending: 4 },
    },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

export default function ManageTeamsPage({}: { params: { serviceId: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className=" px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-balance">Manage Teams</h1>
              <p className="text-muted-foreground">
                {serviceData.name} Service
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search teams or members..." className="pl-10" />
          </div>
          <Button variant="outline">All Teams</Button>
          <Button variant="outline">Active Only</Button>
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6">
          {serviceData.teams.map((team, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <Badge variant="secondary">
                      {team.members.length} members
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Team Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="font-semibold text-orange-700">
                        {team.stats.active}
                      </div>
                      <div className="text-xs text-orange-600">
                        Active Tasks
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-semibold text-green-700">
                        {team.stats.completed}
                      </div>
                      <div className="text-xs text-green-600">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-semibold text-yellow-700">
                        {team.stats.pending}
                      </div>
                      <div className="text-xs text-yellow-600">Pending</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Team Members */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Team Members
                  </h4>
                  <div className="grid gap-3">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {member.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
