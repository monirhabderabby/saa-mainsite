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
  counts: {
    // ← add this
    all: number;
    requested: number;
    given: number;
  };
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
  profileIds?: string;
  searchQuery?: string;
}

export function useGetQueues({
  page = 1,
  limit = 10,
  status,
  profileIds,
  searchQuery,
}: UseGetQueuesOptions = {}) {
  return useQuery({
    queryKey: ["queues", page, limit, status, profileIds, searchQuery],
    queryFn: async (): Promise<GetQueuesResponse> => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (status) params.set("status", status);
      if (profileIds) params.set("profileIds", profileIds);
      if (searchQuery) params.set("searchQuery", searchQuery);

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
