"use client";
import { deleteStation } from "@/actions/station-update/delete";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  stationId: string;
}

const StationActions = ({ stationId }: Props) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onDeleteStation = () => {
    startTransition(() => {
      deleteStation(stationId)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }
          toast.success(res.message);
        })
        .finally(() => {
          setOpen(false);
        });
    });
  };

  return (
    <div className="space-x-3">
      <Button size="icon" variant="outline" asChild>
        <Link href={`/station-update/edit/${stationId}`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash />
      </Button>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDeleteStation}
        loading={isPending}
        title="Delete this station?"
        message="This action will permanently remove the station and its associated data. This cannot be undone."
      />
    </div>
  );
};

export default StationActions;
