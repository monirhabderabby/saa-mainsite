const AddDesignationModal = dynamic(
  () => import("@/components/shared/modal/add-designation-modal"),
  {
    ssr: false,
  }
);
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import dynamic from "next/dynamic";
import { useState } from "react";

interface Props {
  data: { id: string; name: string };
  serviceName: string;
  serviceId: string;
}

const DesignationBadge = ({ data, serviceId, serviceName }: Props) => {
  const [menuKey, setMenuKey] = useState(0);
  return (
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
          >
            Delete
          </Button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default DesignationBadge;
