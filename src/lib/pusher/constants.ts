// Channel naming convention: private-user-{userId}
// This way each user listens to their own private channel

export const getUserChannel = (userId: string) => `user-${userId}`;

export const PUSHER_EVENTS = {
  QUEUE_REQUESTED: "queue:requested",
  QUEUE_GIVEN: "queue:given",
  UPDATE_SHEET_CREATED: "update-sheet:created",
} as const;

export type PusherEvent = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];
