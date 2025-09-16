"use client";
import { removeMember } from "@/actions/teams/delete";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
  teamId: string;
  userId: string;
}

const RemoveMemberAction = ({ userId, teamId }: Props) => {
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(() => {
      removeMember(userId, teamId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
      });
    });
  };
  return (
    <Button
      variant="ghost"
      className="text-red-600 hover:text-red-600 hover:bg-red-400/10 py-1 text-sm"
      size="sm"
      disabled={pending}
      onClick={onDelete}
    >
      Remove from Team
    </Button>
  );
};

export default RemoveMemberAction;
