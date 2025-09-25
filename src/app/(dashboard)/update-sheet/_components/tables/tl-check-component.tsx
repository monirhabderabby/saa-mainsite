import { tlCheck } from "@/actions/update-sheet/tl-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
const ProfileToolTip = dynamic(
  () => import("@/components/ui/profile-tooltip"),
  {
    ssr: false,
  }
);

interface Props {
  data: UpdateSheetData;
}

const TlCheckComponent = ({ data }: Props) => {
  const [pending, startTransition] = useTransition();
  const [isChecked, setIsChecked] = useState(!!data.tlId); // Initialize based on tlId presence

  const queryClient = useQueryClient();

  const onChange = () => {
    const previousState = isChecked; // Store current state for revert
    setIsChecked(!isChecked); // Optimistically update state immediately

    startTransition(async () => {
      try {
        const result = await tlCheck(data.id);
        if (!result.success) {
          setIsChecked(previousState); // Revert state on failure
          toast.error(result.message);
        } else {
          toast.success(result.message);
          queryClient.invalidateQueries({ queryKey: ["update-entries"] });
        }
      } catch {
        setIsChecked(previousState); // Revert state on unexpected error
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex justify-center items-center">
      {data.doneById && data.tlCheckAt && data.tlId ? (
        <ProfileToolTip
          trigger={
            <Button variant="link">
              @{data.tlBy?.fullName?.split(" ")[0]}
            </Button>
          }
          fullName={data.tlBy?.fullName ?? ""}
          joiningDate={data.tlCheckAt}
          designation={data.tlBy?.designation.name ?? ""}
        />
      ) : (
        <Checkbox
          checked={isChecked}
          onCheckedChange={onChange}
          disabled={pending}
          aria-label="TL Check"
        />
      )}
    </div>
  );
};

export default TlCheckComponent;
