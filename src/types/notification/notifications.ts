export type QueueNotificationPayload = {
  type: "QUEUE_REQUESTED" | "QUEUE_GIVEN";
  queueId: string;
  queueKey: string;
  clientName: string;
  profileName: string;
  profileId: string;
  requestedBy: string;
  message: string;
  createdAt: string;
};

export type UpdateSheetNotificationPayload = {
  type: "UPDATE_SHEET_CREATED";
  updateSheetId: string;
  clientName: string;
  orderId: string;
  profileName: string;
  profileId: string;
  createdBy: string;
  createdAt: string;
};

export type NotificationPayload =
  | QueueNotificationPayload
  | UpdateSheetNotificationPayload;
