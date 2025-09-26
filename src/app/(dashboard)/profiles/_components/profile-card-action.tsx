"use client";
import { deleteProfile } from "@/actions/profiles/delete";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Profile } from "@prisma/client";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
const AlertModal = dynamic(() => import("@/components/ui/custom/alert-modal"), {
  ssr: false,
});
const AddProfileDialog = dynamic(() => import("./add-profile-dialog"), {
  ssr: false,
});

interface Props {
  data: Profile;
}

const ProfileCardAction = ({ data }: Props) => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(() => {
      deleteProfile(data.id).then((res) => {
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
      <DropdownMenu open={dropdownMenu} onOpenChange={setDropdownMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <AddProfileDialog
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
              onClose={() => setDropdownMenu(false)}
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
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={pending}
        title="Delete Profile Permanently?"
        message={`Deleting "${data.name}" will permanently remove this service from your system. Any appointments, records, or analytics associated with this service will be affected. This action cannot be undone.`}
      />
    </>
  );
};

export default ProfileCardAction;
