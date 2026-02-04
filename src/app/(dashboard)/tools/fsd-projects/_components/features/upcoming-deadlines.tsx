import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@prisma/client";
import { Building2 } from "lucide-react";

interface Props {
  loggedinUserId: string;
}

const statusColors: Record<ProjectStatus, string> = {
  Revision: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-50",
  WIP: "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-50",
  Delivered:
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  NRA: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-50",
  Cancelled: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-50",
};

// Urgency-based border colors (days until deadline)
function getUrgencyColor(daysLeft: number): string {
  if (daysLeft <= 3) return "bg-red-500";
  if (daysLeft <= 7) return "bg-amber-400";
  if (daysLeft <= 14) return "bg-emerald-500";
  return "bg-sky-400";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDaysLeft(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getDaysLeftText(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

function getDaysLeftColor(daysLeft: number): string {
  if (daysLeft < 0) return "text-red-600";
  if (daysLeft <= 3) return "text-red-500";
  if (daysLeft <= 7) return "text-amber-600";
  return "text-muted-foreground";
}

const UpcomingDeadlines = async ({ loggedinUserId }: Props) => {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const projects = await prisma.project.findMany({
    where: {
      projectAssignments: {
        some: {
          userId: loggedinUserId,
        },
      },
      status: {
        not: "Delivered",
      },
    },
  });

  const sortedProjects = [...projects].sort((a, b) => {
    const aDays = getDaysLeft(a.deadline);
    const bDays = getDaysLeft(b.deadline);

    // overdue first (negative numbers)
    return aDays - bDays;
  });

  return (
    <div className="flex flex-col w-full h-[440px] border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-foreground">
          Upcoming Deadlines
        </h2>
        <span className="text-[11px] text-sky-600 font-medium">
          Next 7 days
        </span>
      </div>

      <ScrollArea className="h-full w-full min-h-0">
        <div className="space-y-2 pr-2">
          {sortedProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming deadlines in the next 7 days
            </div>
          ) : (
            sortedProjects.map((project) => {
              const daysLeft = getDaysLeft(project.deadline);
              const status = (project.status as ProjectStatus) || "WIP";

              return (
                <div
                  key={project.id}
                  className="flex items-start gap-3 p-2.5 rounded-md bg-card hover:bg-accent/40 transition-colors"
                >
                  <div
                    className={cn(
                      "w-[3px] self-stretch rounded-full",
                      getUrgencyColor(daysLeft),
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate text-sm">
                      {project.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="text-[11px] truncate">
                          {project.clientName || "No client"}
                        </span>
                      </div>

                      <Badge
                        className={cn(
                          "text-[8px] px-1 py-0.5 font-medium shadow-none",
                          statusColors[status],
                        )}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "text-[11px] font-medium",
                        getDaysLeftColor(daysLeft),
                      )}
                    >
                      {formatDate(project.deadline)}
                    </div>
                    <div
                      className={cn("text-[10px]", getDaysLeftColor(daysLeft))}
                    >
                      {getDaysLeftText(daysLeft)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UpcomingDeadlines;
