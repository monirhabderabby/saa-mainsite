// hooks/useDeleteComplaint.ts
"use client";

import { deleteComplaintAction } from "@/actions/complains/delete";
import { Complaint } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetMyComplainsResponse } from "./use-get-my-complains";

export function useDeleteComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: string) => {
      const res = await deleteComplaintAction(complaintId);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (_, complaintId) => {
      toast.success("Complaint deleted.");
      queryClient.setQueriesData(
        { queryKey: ["my-complains"] },
        (old: GetMyComplainsResponse) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((c: Complaint) => c.id !== complaintId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        },
      );
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete complaint.");
    },
  });
}
