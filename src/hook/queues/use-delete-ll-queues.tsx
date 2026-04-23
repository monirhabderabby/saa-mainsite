// hooks/useDeleteAllQueues.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface DeleteAllQueuesResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  };
}

export function useDeleteAllQueues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<DeleteAllQueuesResponse> => {
      const res = await fetch("/api/queues/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete queues.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues"] });
    },
  });
}
