"use client";

import { deleteAllStations } from "@/actions/station-update/delete";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import { Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const StationHeaderAction = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onClear = () => {
    startTransition(() => {
      deleteAllStations().then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
      });
    });
  };
  return (
    <div className="flex items-center gap-5">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Trash /> Clear Station
      </Button>
      <Link href="/station-update/new">
        <Button>
          <Plus className="h-4 w-4" />
          New Update
        </Button>
      </Link>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onClear}
        loading={isPending}
        title="Permanent deletion of all stations"
        message="You are about to permanently delete ALL station records and their related assignments. This will completely wipe station data from the system and cannot be recovered. This action is intended for administrators only."
      />
    </div>
  );
};

export default StationHeaderAction;
