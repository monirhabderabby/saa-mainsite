"use client";
import { deleteProject } from "@/actions/tools/fsd-projects/delete";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AlertModal from "@/components/ui/custom/alert-modal";
import { Label } from "@/components/ui/label";
import { useFsdProjectFilterState } from "@/zustand/tools/fsd-project";
import "@smastrom/react-rating/style.css";
import { useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toYMD } from "../../../../_components/fsd-project-table-container";
import MotionCard from "./motion-card";

interface ApiResponse {
  success: boolean;
  data: SafeProjectDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface QuickActionCardProps {
  projectId: string;
}

export default function QuickActionCard({ projectId }: QuickActionCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    clientName,
    orderId,
    teamId,
    profileId,
    status,
    shift,
    deadlineFrom,
    deadlineTo,
    lastUpdateTo,
    nextUpdateTo,
    page,
  } = useFsdProjectFilterState();
  const preparedClientName = clientName ?? "";
  const preparedOrderId = orderId ?? "";
  const preparedTeamids = teamId ? teamId?.join(",") : "";
  const preparedProfileIds = profileId === "All" ? "" : (profileId ?? "");

  const preparedStatus = status ? status.join(",") : "";
  const preparedShift = shift === "All" ? "" : (shift ?? "");

  // Deadlines filter
  const preparedDeadlineFrom = deadlineFrom
    ? new Date(deadlineFrom).toISOString().split("T")[0]
    : "";
  const preparedDeadlineTo = deadlineTo
    ? new Date(deadlineTo).toISOString().split("T")[0]
    : "";

  const preparedLastUpdate = toYMD(new Date(lastUpdateTo!));
  const preparedNextUpdate = toYMD(new Date(nextUpdateTo!));

  const FSDProjectTableQueryKey = [
    "fsd-projects",
    preparedClientName,
    preparedOrderId,
    preparedTeamids,
    preparedProfileIds,
    preparedStatus,
    preparedShift,
    preparedDeadlineFrom,
    preparedDeadlineTo,
    preparedLastUpdate,
    preparedNextUpdate,
    page,
  ];

  const router = useRouter();
  const queryClient = useQueryClient();

  const onDeleteProject = () => {
    startTransition(() => {
      deleteProject(projectId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        setDeleteModalOpen(false);

        // --------------------------------------------------------
        // Update Cache Manually
        // --------------------------------------------------------
        queryClient.setQueryData<ApiResponse>(
          FSDProjectTableQueryKey,
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: oldData.data.filter((item) => item.id !== projectId),
              pagination: {
                ...oldData.pagination,
                total: oldData.pagination.total - 1,
              },
            };
          },
        );

        router.back();
      });
    });
  };
  return (
    <MotionCard delay={0.3}>
      <Card className="shadow-none">
        <CardContent className="pt-3 px-3 space-y-2">
          <Label>Quick Action</Label>

          <div>
            <Button
              variant="destructive"
              className="w-full bg-red-200/20 border-[0.5px] border-rose-400/50 hover:bg-red-200/40 text-rose-500"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDeleteProject}
        loading={isPending}
        title="Delete this project?"
        message="Are you sure? This will permanently delete the project, remove all team assignments, and clear associated metadata. This action cannot be undone."
      />
    </MotionCard>
  );
}
