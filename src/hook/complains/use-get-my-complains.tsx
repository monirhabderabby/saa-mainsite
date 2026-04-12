import { ComplaintPriority, ComplaintStatus, Prisma } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export type ComplaintWithCreator = Prisma.ComplaintGetPayload<{
  include: {
    creator: {
      include: {
        service: true;
        designation: true;
        department: true;
      };
    };
  };
}>;

export interface GetMyComplainsResponse {
  success: boolean;
  data: ComplaintWithCreator[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseGetMyComplainsOptions {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
}

export function useGetMyComplains({
  page = 1,
  limit = 10,
  status,
  priority,
}: UseGetMyComplainsOptions = {}) {
  return useQuery({
    queryKey: ["my-complains", page, limit, status, priority],
    queryFn: async (): Promise<GetMyComplainsResponse> => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const res = await fetch(`/api/complains/me?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch complaints");
      }

      return res.json();
    },
  });
}
