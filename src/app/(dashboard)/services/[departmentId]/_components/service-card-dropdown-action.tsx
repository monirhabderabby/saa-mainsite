"use client";
import { deleteService } from "@/actions/services/delete";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prisma } from "@prisma/client";
import { Briefcase, EllipsisVertical, Pencil, Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});
const AddServiceDialog = dynamic(() => import("./add-service-modal"), {
  ssr: false,
});
const AddDesignationModal = dynamic(
  () => import("@/components/shared/modal/add-designation-modal"),
  {
    ssr: false,
  }
);

type ServiceType = Prisma.ServicesGetPayload<{
  include: {
    designations: {
      select: {
        id: true;
        name: true;
      };
    };
    department: true;
  };
}>;

interface Props {
  data: ServiceType;
}

const ServiceCardDropdownAction = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(() => {
      deleteService(data.id).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // handle success
        toast.success(res.message);
        setOpen(false);
      });
    });
  };
  return (
    <>
      <DropdownMenu open={dropdownMenuOpen} onOpenChange={setDropdownMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <AddDesignationModal
              onClose={() => setDropdownMenuOpen(false)}
              serviceId={data.id}
              serviceName={data.name}
              trigger={
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start"
                  size="sm"
                >
                  <Briefcase />
                  Add Designation
                </Button>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            {data.departmentId && (
              <AddServiceDialog
                departmentId={data.departmentId}
                trigger={
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start"
                    size="sm"
                  >
                    <Pencil />
                    Edit
                  </Button>
                }
                initialData={data}
                onClose={() => setDropdownMenuOpen(false)}
              />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start cursor-pointer"
              size="sm"
              onClick={() => setOpen((p) => !p)}
            >
              <Trash />
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={pending}
        title="Delete Service Permanently?"
        message={`Deleting "${data.name}" will permanently remove this service from your system. Any appointments, records, or analytics associated with this service will be affected. This action cannot be undone.`}
      />
    </>
  );
};

export default ServiceCardDropdownAction;
