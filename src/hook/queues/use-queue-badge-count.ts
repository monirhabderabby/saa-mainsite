// hooks/queues/use-queue-badge-count.ts
"use client";

import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect } from "react";

export const QUEUE_BADGE_QUERY_KEY = ["queue-badge-count"] as const;

interface PendingCountResponse {
  success: boolean;
  count: number;
}

async function fetchPendingCount(): Promise<PendingCountResponse> {
  const res = await fetch("/api/queues/pending-count", { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to fetch queue pending count.");
  }
  return res.json();
}

/**
 * Hook that:
 * 1. Fetches the count of REQUESTED (not yet GIVEN) queues for the user's
 *    station profiles via a lightweight REST endpoint.
 * 2. Invalidates + refetches the count in real-time whenever a
 *    `queue:requested` or `queue:given` Pusher event arrives on the user's
 *    private channel.
 *
 * Only meaningful for SALES_MEMBER — the API returns 0 for other roles.
 */
export function useQueueBadgeCount() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: QUEUE_BADGE_QUERY_KEY,
    queryFn: fetchPendingCount,
    refetchInterval: 60_000, // passive refresh every 60 s as a safety net
    enabled: !!session?.user?.id,
  });

  // Real-time invalidation via Pusher
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = getUserChannel(session.user.id);
    const channel = pusherClient.subscribe(channelName);

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_BADGE_QUERY_KEY });
    };

    // A new queue was requested → count may go up
    channel.bind(PUSHER_EVENTS.QUEUE_REQUESTED, invalidate);
    // A queue was given → count goes down
    channel.bind(PUSHER_EVENTS.QUEUE_GIVEN, invalidate);

    return () => {
      channel.unbind(PUSHER_EVENTS.QUEUE_REQUESTED, invalidate);
      channel.unbind(PUSHER_EVENTS.QUEUE_GIVEN, invalidate);
      pusherClient.unsubscribe(channelName);
    };
  }, [session?.user?.id, queryClient]);

  return data?.count ?? 0;
}
