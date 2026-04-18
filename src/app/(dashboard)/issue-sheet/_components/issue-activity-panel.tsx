"use client";

import {
  addIssueComment,
  getIssueActivities,
} from "@/actions/issue-sheet/activity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IssueActivityType } from "@prisma/client";
import {
  ArrowRightLeft,
  Clock,
  Loader2,
  MessageSquare,
  PenLine,
  Plus,
  Send,
  Users,
} from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: IssueActivityType;
  content: string | null;
  meta: unknown;
  actorId: string;
  issueSheetId: string;
  createdAt: Date;
  actor: {
    fullName: string;
    nickName: string;
    image: string | null;
    employeeId: string;
  };
}

interface Props {
  issueSheetId: string;
}

const getActivityIcon = (type: IssueActivityType) => {
  switch (type) {
    case "COMMENT":
      return MessageSquare;
    case "STATUS_CHANGE":
      return ArrowRightLeft;
    case "TEAM_ASSIGNED":
      return Users;
    case "ISSUE_UPDATED":
      return PenLine;
    case "ISSUE_CREATED":
      return Plus;
    default:
      return Clock;
  }
};

const getActivityColor = (type: IssueActivityType) => {
  switch (type) {
    case "COMMENT":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "STATUS_CHANGE":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "TEAM_ASSIGNED":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "ISSUE_UPDATED":
      return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    case "ISSUE_CREATED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    case "wip":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    case "done":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    case "cancelled":
      return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20";
    case "dispute":
      return "bg-purple-500/15 text-purple-400 border border-purple-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400";
  }
};

const formatStatusLabel = (status: string) => {
  if (status === "wip") return "WIP";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);
  const meta = activity.meta as Record<string, string> | null;

  return (
    <div className="flex gap-2.5 py-3 group">
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 border",
          colorClass,
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-foreground truncate">
            {activity.actor.nickName} ({activity.actor.employeeId})
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {moment(activity.createdAt).fromNow()}
          </span>
        </div>

        {/* Activity-specific content */}
        {activity.type === "COMMENT" && activity.content && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap break-words">
            {activity.content}
          </p>
        )}

        {activity.type === "STATUS_CHANGE" && meta && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                getStatusBadgeColor(meta.from),
              )}
            >
              {formatStatusLabel(meta.from)}
            </span>
            <ArrowRightLeft className="w-3 h-3 text-muted-foreground/40" />
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                getStatusBadgeColor(meta.to),
              )}
            >
              {formatStatusLabel(meta.to)}
            </span>
          </div>
        )}

        {activity.type === "TEAM_ASSIGNED" && meta && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-foreground/80">
              {meta.teamName}
            </span>
          </p>
        )}

        {activity.type === "ISSUE_UPDATED" && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Updated issue details
          </p>
        )}

        {activity.type === "ISSUE_CREATED" && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Created this issue
          </p>
        )}
      </div>
    </div>
  );
};

const IssueActivityPanel = ({ issueSheetId }: Props) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchActivities = useCallback(async () => {
    const result = await getIssueActivities(issueSheetId);
    if (result.success && result.data) {
      setActivities(result.data as Activity[]);
    }
    setLoading(false);
  }, [issueSheetId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    startTransition(async () => {
      const result = await addIssueComment(issueSheetId, comment);
      if (result.success) {
        setComment("");
        toast.success("Comment added");
        // Re-fetch activities to get the new comment
        await fetchActivities();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="w-[280px] border-l border-border/50 bg-muted/20 flex flex-col shrink-0 h-[80vh] min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Comments & updates
        </p>
      </div>

      {/* Activity List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin" />
              <p className="text-xs text-muted-foreground/50 mt-2">
                Loading activity...
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-2">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/60">
                No activity yet
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                Be the first to add a comment
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t border-border/50 p-3">
        <div className="flex items-start gap-2">
          <Avatar className="w-6 h-6 mt-1 shrink-0">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              className="min-h-[36px] max-h-[80px] text-xs resize-none border-border/50 bg-background/50 focus:bg-background transition-colors"
              rows={1}
              disabled={isPending}
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[9px] text-muted-foreground/40">
                Enter to send
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs gap-1"
                onClick={handleSubmitComment}
                disabled={isPending || !comment.trim()}
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueActivityPanel;
