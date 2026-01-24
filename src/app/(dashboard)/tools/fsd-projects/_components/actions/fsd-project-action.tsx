"use client";

import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, EllipsisVertical, Eye, FileEdit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AddProjectModal from "../add-project-modal";
// import { useRouter } from "next/navigation";             // if needed

interface Props {
  project: SafeProjectDto;
}

export default function FsdProjectActions({ project }: Props) {
  const [editable, setEditable] = useState(false);

  const copyOrderId = () => {
    navigator.clipboard.writeText(project.orderId || project.id || "—");

    toast.success("Copied", {
      description: "Order ID copied to clipboard",
    });
  };

  const handleView = () => {
    // router.push(`/projects/${project.id}`);
    window.open(`/projects/${project.id}`, "_blank");
    // or open in modal
  };

  const handleEdit = () => {
    setEditable(true);
  };

  const handleDelete = () => {
    if (!confirm("Delete this project? This action cannot be undone.")) return;
    // await deleteProject(project.id);
  };

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

            <DropdownMenuItem onClick={handleView} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Project
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleDelete}
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
    </>
  );
}
