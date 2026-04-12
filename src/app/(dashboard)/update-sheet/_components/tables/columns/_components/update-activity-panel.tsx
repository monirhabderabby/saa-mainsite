"use client";

import {
  addUpdateComment,
  getUpdateActivities,
} from "@/actions/update-sheet/activity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { UpdateActivityType } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  ShieldOff,
  StickyNote
} from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: UpdateActivityType;
  content: string | null;
  meta: unknown;
  actorId: string;
  updateSheetId: string;
  createdAt: Date;
  actor: {
    fullName: string;
    nickName: string;
    image: string | null;
  };
}

interface Props {
  updateSheetId: string;
}

const getActivityIcon = (type: UpdateActivityType) => {
  switch (type) {
    case "COMMENT":
      return MessageSquare;
    case "ENTRY_CREATED":
      return Plus;
    case "ENTRY_UPDATED":
      return PenLine;
    case "TL_CHECKED":
      return ShieldCheck;
    case "TL_UNCHECKED":
      return ShieldOff;
    case "MARKED_AS_SENT":
      return CheckCircle2;
    case "SALES_NOTE_ADDED":
      return StickyNote;
    case "OP_COMMENT_ADDED":
      return MessageSquare;
    default:
      return Clock;
  }
};

const getActivityColor = (type: UpdateActivityType) => {
  switch (type) {
    case "COMMENT":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "ENTRY_CREATED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "ENTRY_UPDATED":
      return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    case "TL_CHECKED":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "TL_UNCHECKED":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "MARKED_AS_SENT":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "SALES_NOTE_ADDED":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "OP_COMMENT_ADDED":
      return "bg-teal-500/10 text-teal-500 border-teal-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

const getActivityLabel = (type: UpdateActivityType) => {
  switch (type) {
    case "COMMENT":
      return null; // content shown directly
    case "ENTRY_CREATED":
      return "Created this entry";
    case "ENTRY_UPDATED":
      return "Updated entry details";
    case "TL_CHECKED":
      return "Approved TL Check";
    case "TL_UNCHECKED":
      return "Removed TL Check";
    case "MARKED_AS_SENT":
      return "Marked as sent";
    case "SALES_NOTE_ADDED":
      return "Added a sales note";
    case "OP_COMMENT_ADDED":
      return "Added operation comment";
    default:
      return "Performed an action";
  }
};

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);
  const label = getActivityLabel(activity.type);

  return (
    <div className="flex gap-2.5 py-3 group">
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 border",
          colorClass
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-foreground truncate">
            {activity.actor.nickName}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {moment(activity.createdAt).fromNow()}
          </span>
        </div>

        {/* Comment content */}
        {activity.type === "COMMENT" && activity.content && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap break-words">
            {activity.content}
          </p>
        )}

        {/* Sales note content */}
        {activity.type === "SALES_NOTE_ADDED" && activity.content && (
          <div className="mt-1">
            <p className="text-xs text-muted-foreground/80 mb-0.5">{label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words italic">
              &quot;{activity.content}&quot;
            </p>
          </div>
        )}

        {/* System event label */}
        {activity.type !== "COMMENT" &&
          activity.type !== "SALES_NOTE_ADDED" &&
          label && (
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          )}
      </div>
    </div>
  );
};

const UpdateActivityPanel = ({ updateSheetId }: Props) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchActivities = useCallback(async () => {
    const result = await getUpdateActivities(updateSheetId);
    if (result.success && result.data) {
      setActivities(result.data as Activity[]);
    }
    setLoading(false);
  }, [updateSheetId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    startTransition(async () => {
      const result = await addUpdateComment(updateSheetId, comment);
      if (result.success) {
        setComment("");
        toast.success("Comment added");
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
    <div className="flex flex-col h-full min-h-0">
      {/* Activity List - scrollable */}
      <ScrollArea className="flex-1 min-h-0 h-full [&>[data-radix-scroll-area-viewport]]:h-full">
        <div className="px-4 py-2">
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

      {/* Comment Input - fixed footer */}
      <div className="border-t border-border/50 p-3 shrink-0">
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

export default UpdateActivityPanel;
