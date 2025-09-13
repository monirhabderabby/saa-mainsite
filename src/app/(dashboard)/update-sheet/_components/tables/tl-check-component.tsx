import { tlCheck } from "@/actions/update-sheet/update";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateSheetData } from "@/helper/update-sheet";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: UpdateSheetData;
}

const TlCheckComponent = ({ data }: Props) => {
  const [pending, startTransition] = useTransition();
  const [isChecked, setIsChecked] = useState(!!data.tlId); // Initialize based on tlId presence

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
        }
      } catch {
        setIsChecked(previousState); // Revert state on unexpected error
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Checkbox
      checked={isChecked}
      onCheckedChange={onChange}
      disabled={pending}
      aria-label="TL Check"
    />
  );
};

export default TlCheckComponent;
