// types/queue.ts

export type QueueStatus = "REQUESTED" | "GIVEN";

export interface QueueLink {
  id: string;
  queueId: string;
  title: string;
  url: string;
  createdAt: Date;
}

export interface QueueUser {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}

export interface Queue {
  id: string;
  queueKey: string;
  profileId: string;
  clientName: string;
  orderId?: string | null;
  message: string;
  status: QueueStatus;
  requestedById: string;
  requestedBy: QueueUser;
  assignedToId?: string | null;
  assignedTo?: QueueUser | null;
  links: QueueLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQueueInput {
  profileId: string;
  clientName: string;
  orderId?: string;
  message: string;
}

export interface AddLinksInput {
  queueId: string;
  links: { title: string; url: string }[];
}
