"use client";
import { MultiSelect } from "@/components/ui/multi-select";
import { useEffect } from "react";
import { useSupportPeriodState } from "./states/support-period-state";

interface Props {
  teams: {
    value: string;
    label: string;
  }[];
  cuTeamId?: string;
}

const SupportFilterCodntainer = ({ teams, cuTeamId }: Props) => {
  const { teamIds, setTeamIds } = useSupportPeriodState();

  useEffect(() => {
    if (cuTeamId) {
      setTeamIds([cuTeamId]);
    }
  }, [cuTeamId, setTeamIds]);

  return (
    <div>
      <MultiSelect
        options={teams}
        placeholder="Select Teams"
        value={teamIds ?? []}
        onValueChange={(val) => setTeamIds(val)}
        isToolTipEnabled={false}
      />
    </div>
  );
};

export default SupportFilterCodntainer;
