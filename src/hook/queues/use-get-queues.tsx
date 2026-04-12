// hooks/useGetQueues.ts
import { Prisma } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export type QueueWithRelations = Prisma.QueueGetPayload<{
  include: {
    requestedBy: {
      select: {
        id: true;
        fullName: true;
        email: true;
        role: true;
      };
    };
    assignedTo: {
      select: {
        id: true;
        fullName: true;
        email: true;
        role: true;
      };
    };
    links: true;
    profile: true;
  };
}>;

export interface GetQueuesResponse {
  success: boolean;
  message: string;
  data: QueueWithRelations[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseGetQueuesOptions {
  page?: number;
  limit?: number;
  status?: "REQUESTED" | "GIVEN";
  profileId?: string;
  clientName?: string;
  orderId?: string;
  queueKey?: string;
}

export function useGetQueues({
  page = 1,
  limit = 10,
  status,
  profileId,
  clientName,
  orderId,
  queueKey,
}: UseGetQueuesOptions = {}) {
  return useQuery({
    queryKey: [
      "queues",
      page,
      limit,
      status,
      profileId,
      clientName,
      orderId,
      queueKey,
    ],
    queryFn: async (): Promise<GetQueuesResponse> => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (status) params.set("status", status);
      if (profileId) params.set("profileId", profileId);
      if (clientName) params.set("clientName", clientName);
      if (orderId) params.set("orderId", orderId);
      if (queueKey) params.set("queueKey", queueKey);

      const res = await fetch(`/api/queues?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch queues.");
      }

      return res.json();
    },
  });
}
