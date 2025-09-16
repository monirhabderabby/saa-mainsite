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
          trigger={
            <Button variant="link">
              @{data.tlBy?.fullName?.split(" ")[0]}
            </Button>
          }
          fullName={data.tlBy?.fullName ?? ""}
          joiningDate={data.tlBy?.emailVerified}
        />
      )}
    </div>
  );
};

export default DoneByComponent;
