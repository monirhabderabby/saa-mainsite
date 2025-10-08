import { tlCheck } from "@/actions/update-sheet/tl-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { Role } from "@prisma/client";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CurrentUserTeam } from "../table-container";
const ProfileToolTip = dynamic(
  () => import("@/components/ui/profile-tooltip"),
  {
    ssr: false,
  }
);

interface Props {
  data: UpdateSheetData;
  currentUserId: string;
  currentUserRole: Role;
  currentUserTeam?: CurrentUserTeam | null;
}

const adminRoles = ["SUPER_ADMIN", "ADMIN"] as Role[];

const TlCheckComponent = ({
  data,
  currentUserId,
  currentUserRole,
  currentUserTeam,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const [isChecked, setIsChecked] = useState(!!data.tlId);

  // const queryClient = useQueryClient();

  const onChange = () => {
    const previousState = isChecked;
    setIsChecked((p) => !p);

    startTransition(async () => {
      try {
        const result = await tlCheck(data.id);
        if (!result.success) {
          setIsChecked(previousState);
          toast.error(result.message);
        } else {
          // toast.success(result.message);
          // queryClient.invalidateQueries({ queryKey: ["update-entries"] });
        }
      } catch {
        setIsChecked(previousState);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  // 1. creator
  const isCreator = data.updateById === currentUserId;

  // 2. admins
  const isAdmins = adminRoles.includes(currentUserRole);

  // 3. team leader or co-leader under same service line
  const isServiceLineTeamLeader =
    ["Leader", "Coleader"].includes(currentUserTeam?.responsibility ?? "") &&
    currentUserTeam?.team?.serviceId === data.updateBy?.serviceId;

  // 4. service manager of creator’s service
  const isServiceManager =
    data.updateBy.service?.serviceManagerId === currentUserId;

  const canCheck =
    (isCreator || isAdmins || isServiceLineTeamLeader || isServiceManager) &&
    !data.doneById;

  return (
    <div className="flex justify-center items-center">
      {canCheck ? (
        <Checkbox
          checked={isChecked}
          onCheckedChange={onChange}
          disabled={pending}
          aria-label="TL Check"
        />
      ) : data.tlId && data.tlCheckAt ? (
        <ProfileToolTip
          trigger={<Button variant="link">@{data.tlBy?.nickName}</Button>}
          fullName={data.tlBy?.fullName ?? ""}
          joiningDate={data.tlCheckAt}
          designation={data.tlBy?.designation.name ?? ""}
          profilePhoto={data.tlBy?.image ?? ""}
        />
      ) : (
        "N/A"
      )}
    </div>
  );
};

export default TlCheckComponent;
