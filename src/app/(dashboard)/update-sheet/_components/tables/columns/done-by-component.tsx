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
  return (
    <div className="flex justify-center items-center">
      {data.doneById && (
        <ProfileToolTip
          trigger={<Button variant="link">@{data.doneBy?.nickName}</Button>}
          fullName={data.doneBy?.fullName ?? ""}
          joiningDate={data.sendAt}
          designation={data.doneBy?.designation?.name ?? ""}
          profilePhoto={data.doneBy?.image ?? ""}
        />
      )}
    </div>
  );
};

export default DoneByComponent;
