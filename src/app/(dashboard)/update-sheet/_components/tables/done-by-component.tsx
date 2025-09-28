import { Button } from "@/components/ui/button";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import dynamic from "next/dynamic";
const ProfileToolTip = dynamic(
  () => import("@/components/ui/profile-tooltip"),
  {
    ssr: false,
  }
);

interface Props {
  data: UpdateSheetData;
}

const DoneByComponent = ({ data }: Props) => {
  // Extract team name safely
  // Extract team name safely
  const getTeamName = () => {
    if (!data.doneBy?.userTeams || data.doneBy.userTeams.length === 0) {
      return "No team";
    }

    return data.doneBy.userTeams[0]?.team?.name ?? "No team";
  };

  console.log(getTeamName());

  return (
    <div className="flex justify-center items-center">
      {data.doneById && (
        <ProfileToolTip
          trigger={<Button variant="link">@{data.doneBy?.nickName}</Button>}
          fullName={data.doneBy?.fullName ?? ""}
          joiningDate={data.sendAt}
          designation={data.doneBy?.designation?.name ?? ""}
          teamName={getTeamName()}
        />
      )}
    </div>
  );
};

export default DoneByComponent;
