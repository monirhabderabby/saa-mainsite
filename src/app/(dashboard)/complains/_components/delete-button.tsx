const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});
import { useDeleteComplaint } from "@/hook/complains/use-delete-complaint";
import { Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const DeleteButton = ({ complaintId }: { complaintId: string }) => {
  const { mutate, isPending } = useDeleteComplaint();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => mutate(complaintId)}
        loading={isPending}
        title="Delete complaint?"
        message="This action is permanent and cannot be undone. The complaint and all associated data will be removed."
      />

      <button
        onClick={() => setOpen(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
        title="Delete complaint"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </button>
    </>
  );
};

export default DeleteButton;
