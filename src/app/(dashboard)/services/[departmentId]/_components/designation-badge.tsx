const AddDesignationModal = dynamic(
  () => import("@/components/shared/modal/add-designation-modal"),
  {
    ssr: false,
  }
);
import { deleteDesignationAction } from "@/actions/designation/delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import AlertModal from "@/components/ui/custom/alert-modal";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: { id: string; name: string };
  serviceName: string;
  serviceId: string;
}

const DesignationBadge = ({ data, serviceId, serviceName }: Props) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [menuKey, setMenuKey] = useState(0);

  const onDelete = () => {
    startTransition(() => {
      deleteDesignationAction(data.id).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
      });
    });
  };
  return (
    <>
      <ContextMenu key={menuKey}>
        <ContextMenuTrigger asChild className="cursor-pointer">
          <Badge variant="secondary">{data.name}</Badge>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem asChild className="w-full">
            <AddDesignationModal
              trigger={
                <Button
                  variant="ghost"
                  className="w-full text-[14px] py-1"
                  size="sm"
                >
                  Edit
                </Button>
              }
              serviceId={serviceId}
              serviceName={serviceName}
              initialData={{
                name: data.name,
                id: data.id,
              }}
              onClose={() => {
                // force remount → closes the menu
                setMenuKey((k) => k + 1);
              }}
            />
          </ContextMenuItem>

          <ContextMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full text-[14px] py-1 outline-none ring-0 cursor-pointer"
              size="sm"
              onClick={() => setOpen(true)}
            >
              Delete
            </Button>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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

export default DesignationBadge;
