"use client";
import { deleteService } from "@/actions/services/delete";
import AddDesignationModal from "@/components/shared/modal/add-designation-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prisma } from "@prisma/client";
import { Briefcase, EllipsisVertical, Pencil, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import AddServiceDialog from "./add-service-modal";

type ServiceType = Prisma.ServicesGetPayload<{
  include: {
    designations: {
      select: {
        id: true;
      };
    };
    department: true;
  };
}>;

interface Props {
  data: ServiceType;
}
const ServiceCard = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
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
      <Card className="shadow-none dark:bg-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-green/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-card-foreground">
                  {data.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Service Overview
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <AddDesignationModal
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
                  <AddServiceDialog
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
                  />
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
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-customYellow-primary">
                {data.designations.length}
              </span>
              <span className="text-sm text-muted-foreground">
                designations
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Total number of designations available in this service
            </p>
          </div>
        </CardContent>
      </Card>
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

export default ServiceCard;
