"use client";

import { useRealtimeNotifications } from "@/hook/use-realtime-notifications";

// This component is a "side-effect only" component
// It subscribes to real-time notifications for the logged-in user
export function NotificationProvider() {
  useRealtimeNotifications();
  return null;
}
