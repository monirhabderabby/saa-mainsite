"use client";
import { deleteService } from "@/actions/services/delete";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Services } from "@prisma/client";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import AddServiceDialog from "./add-service-modal";

interface Props {
  data: Services;
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
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex-1">{data.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
