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

const UpdatedByComponents = ({ data }: Props) => {
  let teamName;

  if (!data.tlBy?.userTeams || data.tlBy.userTeams.length === 0) {
    teamName = "";
  } else {
    teamName = data.tlBy.userTeams[0]?.team?.name;
  }

  return (
    <div className="flex justify-center">
      {data.updateById && (
        <ProfileToolTip
          trigger={<Button variant="link">@{data.updateBy?.nickName}</Button>}
          fullName={data.updateBy?.fullName ?? ""}
          joiningDate={data.createdAt}
          designation={data.updateBy.designation.name ?? ""}
          teamName={teamName}
          profilePhoto={data.updateBy.image ?? ""}
        />
      )}
    </div>
  );
};

export default UpdatedByComponents;
