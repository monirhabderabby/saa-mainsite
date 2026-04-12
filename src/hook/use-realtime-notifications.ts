"use client";

import { playNotificationSound } from "@/lib/notification/notification-sound";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher/constants";
import {
  QueueNotificationPayload,
  UpdateSheetNotificationPayload,
} from "@/types/notification/notifications";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect } from "react";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = getUserChannel(session.user.id);
    const channel = pusherClient.subscribe(channelName);

    // 🔔 Queue Request Notification
    channel.bind(
      PUSHER_EVENTS.QUEUE_REQUESTED,
      (payload: QueueNotificationPayload) => {
        playNotificationSound();

        toast(`📬 New Queue: ${payload.clientName}`, {
          description: `${payload.message}"`,
          duration: 8000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = `/queue`;
            },
          },
        });
      },
    );

    // 🔔 Update Sheet Notification
    channel.bind(
      PUSHER_EVENTS.UPDATE_SHEET_CREATED,
      (payload: UpdateSheetNotificationPayload) => {
        playNotificationSound();

        toast(`📝 Update Sheet: ${payload.clientName}`, {
          description: `Please sent this update ASAP!`,
          duration: 8000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = `/update-sheet`;
            },
          },
        });
      },
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [session?.user?.id]);
}
