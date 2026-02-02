"use client";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeProps } from "@/lib/tools/project-status-style";
import { ProjectStatus } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AddProjectModal from "../../../../_components/add-project-modal";

interface Props {
  data: SafeProjectDto;
}

const ProjectDetailsHeader = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
  const { variant, className } = getStatusBadgeProps(
    data.status as ProjectStatus,
  );

  const onOrderIdCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.orderId);
      // optional: toast / alert
      toast.success("Order id Copied");
    } catch (err) {
      console.error("Failed to copy Order ID", err);
    }
  };
  return (
    <div>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Badge variant={variant} className={className}>
            {data.status}
          </Badge>{" "}
          |{" "}
          <p>
            Order ID:{" "}
            <span className="cursor-pointer" onClick={onOrderIdCopy}>
              #{data.orderId}
            </span>
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Pencil /> Edit
          </Button>
        </div>
      </div>

      <div className="space-y-1 px-2 mt-2">
        <h1 className="text-lg font-bold">E-Commerce Platform Redesign</h1>
        <p className="text-xs font-normal">
          Complete UI/UX redesign with frontend and backend integration
        </p>
      </div>
      <AddProjectModal initialData={data} open={open} setOpen={setOpen} />
    </div>
  );
};

export default ProjectDetailsHeader;
