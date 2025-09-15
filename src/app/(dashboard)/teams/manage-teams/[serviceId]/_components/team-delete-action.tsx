"use client";
import { deleteTeamAction } from "@/actions/teams/delete";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});

interface Props {
  teamId: string;
}

const TeamDeleteAction = ({ teamId }: Props) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(() => {
      deleteTeamAction(teamId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        setOpen(false);
      });
    });
  };
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
        onClick={() => setOpen(true)}
      >
        <Trash className="w-4 h-4 mr-2" />
        Delete team
      </Button>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={pending}
        title="Are you sure you want to delete this team?"
        message="This action will permanently remove the team and all its members from the system. This cannot be undone."
      />
    </div>
  );
};

export default TeamDeleteAction;
