"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { Activity, MoreVertical, Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

const UpdateActivityModal = dynamic(
  () => import("./_components/update-activity-modal"),
  { ssr: false }
);

interface Props {
  data: UpdateSheetData;
}

const UpdateSheetRowAction = ({ data }: Props) => {
  const [activityOpen, setActivityOpen] = useState(false);

  const tlChecked = data.tlId ?? undefined;
  const isTlChecked = !!tlChecked;
  const isSent = !!data.sendAt;

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Existing edit/sent button */}
        {isSent ? (
          <Button disabled variant="ghost" size="sm">
            Sent ✅
          </Button>
        ) : isTlChecked ? (
          <Button disabled size="icon" variant="ghost">
            <Pencil />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/update-sheet/edit/${data.id}`}>
              <Pencil />
            </Link>
          </Button>
        )}

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setActivityOpen(true)}>
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Activity Modal */}
      <UpdateActivityModal
        updateSheetId={data.id}
        open={activityOpen}
        onOpenChange={setActivityOpen}
        clientName={data.clientName}
        orderId={data.orderId}
        profileName={data.profile?.name}
      />
    </>
  );
};

export default UpdateSheetRowAction;
