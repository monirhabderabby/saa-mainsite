import { ComplaintPriority, ComplaintStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { ComplaintWithCreator } from "./use-get-my-complains";

interface GetAdminComplainsResponse {
  success: boolean;
  data: ComplaintWithCreator[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseGetAdminComplainsOptions {
  page?: number;
  limit?: number;
  statuses?: ComplaintStatus[]; // ← array now
  priorities?: ComplaintPriority[]; // ← array now
}

export function useGetAdminComplains({
  page = 1,
  limit = 10,
  statuses = [],
  priorities = [],
}: UseGetAdminComplainsOptions = {}) {
  return useQuery({
    queryKey: ["admin-complains", page, limit, statuses, priorities],
    queryFn: async (): Promise<GetAdminComplainsResponse> => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      // Append each value separately → ?status=OPEN&status=IN_PROGRESS
      statuses.forEach((s) => params.append("status", s));
      priorities.forEach((p) => params.append("priority", p));

      const res = await fetch(`/api/complains/admin?${params.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch complaints");
      }

      return res.json();
    },
  });
}
