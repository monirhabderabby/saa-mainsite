import {
  Complaint,
  ComplaintPriority,
  ComplaintSource,
  ComplaintStatus,
} from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface GetMyComplainsResponse {
  success: boolean;
  data: Complaint[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseGetMyComplainsOptions {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  source?: ComplaintSource;
}

export function useGetMyComplains({
  page = 1,
  limit = 10,
  status,
  priority,
  source,
}: UseGetMyComplainsOptions = {}) {
  return useQuery({
    queryKey: ["admin-complains", page, limit, status, priority, source],
    queryFn: async (): Promise<GetMyComplainsResponse> => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (source) params.set("ComplaintSource", source);

      const res = await fetch(`/api/complains/admin?${params.toString()}`, {
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
