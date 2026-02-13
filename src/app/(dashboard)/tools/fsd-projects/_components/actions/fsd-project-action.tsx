"use client";

import { deleteProject } from "@/actions/tools/fsd-projects/delete";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFsdProjectFilterState } from "@/zustand/tools/fsd-project";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, EllipsisVertical, Eye, FileEdit, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toYMD } from "../fsd-project-table-container";
const AddProjectModal = dynamic(() => import("../add-project-modal"), {
  ssr: false,
});
// import { useRouter } from "next/navigation";             // if needed

interface Props {
  project: SafeProjectDto;
}

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

export default function FsdProjectActions({ project }: Props) {
  const [editable, setEditable] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const copyOrderId = () => {
    navigator.clipboard.writeText(project.orderId || project.id || "—");

    toast.success("Copied", {
      description: "Order ID copied to clipboard",
    });
  };

  const queryClient = useQueryClient();

  const handleEdit = () => {
    setEditable(true);
  };

  const onDeleteProject = () => {
    startTransition(() => {
      deleteProject(project.id).then((res) => {
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
              data: oldData.data.filter((item) => item.id !== project.id),
              pagination: {
                ...oldData.pagination,
                total: oldData.pagination.total - 1,
              },
            };
          },
        );
      });
    });
  };

  console.log("project", project);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <EllipsisVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2 truncate">
            {project.clientName || "Project"}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={copyOrderId} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Copy Order ID
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href={`/tools/fsd-projects/view/${project.id}`}>
                {" "}
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Project
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setDeleteModalOpen(true)}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {/* Optional danger zone separator + extra caution item */}
          {/* <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground italic">
          Danger zone actions
        </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddProjectModal
        open={editable}
        setOpen={setEditable}
        initialData={project}
      />
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDeleteProject}
        loading={isPending}
        title="Delete this project?"
        message="Are you sure? This will permanently delete the project, remove all team assignments, and clear associated metadata. This action cannot be undone."
      />
    </>
  );
}
