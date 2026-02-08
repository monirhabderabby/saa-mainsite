import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, Clock } from "lucide-react";

interface Props {
  loggedinUserId: string;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (diff < 0) {
    return "Overdue";
  } else if (hours === 0) {
    return `${minutes}m left`;
  } else if (hours < 24) {
    return `${hours}h ${minutes}m left`;
  }
  return formatTime(date);
}

const statusConfig = {
  NRA: {
    label: "Not Ready",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  WIP: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  Revision: {
    label: "Revision",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const TodayNeedToUpdate = async ({ loggedinUserId }: Props) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find projects where the user is assigned and nextUpdate is today
  const projectsNeedingUpdate = await prisma.project.findMany({
    where: {
      nextUpdate: {
        gte: today,
        lt: tomorrow,
      },
      projectAssignments: {
        some: {
          userId: loggedinUserId,
        },
      },
      status: {
        in: ["NRA", "WIP", "Revision"], // Only active projects
      },
    },
    include: {
      profile: true,
      projectAssignments: {
        where: {
          userId: loggedinUserId,
        },
        select: {
          role: true,
        },
      },
      salesPerson: {
        select: {
          fullName: true,
        },
      },
      team: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ nextUpdate: "asc" }, { deadline: "asc" }],
  });

  // Also get projects that are overdue for updates
  const overdueProjects = await prisma.project.findMany({
    where: {
      nextUpdate: {
        lt: today,
      },
      projectAssignments: {
        some: {
          userId: loggedinUserId,
        },
      },
      status: {
        in: ["NRA", "WIP", "Revision"],
      },
    },
    include: {
      profile: true,
      projectAssignments: {
        where: {
          userId: loggedinUserId,
        },
        select: {
          role: true,
        },
      },
      salesPerson: {
        select: {
          fullName: true,
        },
      },
      team: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ nextUpdate: "asc" }],
  });

  const allProjects = [...overdueProjects, ...projectsNeedingUpdate];
  const totalCount = allProjects.length;
  const overdueCount = overdueProjects.length;

  return (
    <div className="flex flex-col h-[440px] bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">
              Today’s Updates
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Requires your attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <Badge
              variant="destructive"
              className="gap-1 px-2 py-0.5 text-[11px]"
            >
              <AlertCircle className="h-3 w-3" />
              {overdueCount}
            </Badge>
          )}

          <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="space-y-2 pr-2">
          {allProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground">
                No projects require updates today
              </p>
            </div>
          ) : (
            allProjects.map((project) => {
              const isOverdue = project.nextUpdate
                ? project.nextUpdate < today
                : false;

              return (
                <div
                  key={project.id}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border transition-all duration-200",
                    "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
                    "bg-card",
                    isOverdue
                      ? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
                      : "border-border hover:bg-accent/30",
                  )}
                >
                  {/* Colored left border accent */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 transition-all",
                      isOverdue
                        ? "bg-destructive"
                        : "bg-gradient-to-b from-primary to-primary/60",
                    )}
                  />

                  <div className="flex items-start gap-4 p-4 pl-5">
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate text-sm">
                            {project.title} — {project.clientName}
                          </h3>
                        </div>

                        {/* Time indicator */}
                        <div
                          className={cn(
                            "shrink-0 px-2 py-0.5 rounded-md font-medium text-[11px]",
                            isOverdue
                              ? "bg-destructive/20 text-destructive-foreground dark:bg-destructive/30 dark:text-destructive"
                              : "bg-primary/10 text-primary dark:bg-primary/20",
                          )}
                        >
                          {project.nextUpdate
                            ? formatRelativeTime(project.nextUpdate)
                            : "No time"}
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] px-1 py-0.5 font-normal",
                            statusConfig[project.status].color,
                          )}
                        >
                          {statusConfig[project.status].label}
                        </Badge>

                        <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {project.profile.name}
                        </span>

                        {project.orderId && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            #{project.orderId}
                          </span>
                        )}
                      </div>

                      {/* Quick note or remark if available */}
                      {(project.quickNoteFromLeader ||
                        project.remarkFromOperation) && (
                        <p className="text-[11px] text-muted-foreground italic line-clamp-1 pt-1 border-t border-border/40">
                          {project.quickNoteFromLeader ||
                            project.remarkFromOperation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer stats */}
      {allProjects.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing all projects due for update today</span>
          <span className="font-medium">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).format(today)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TodayNeedToUpdate;
