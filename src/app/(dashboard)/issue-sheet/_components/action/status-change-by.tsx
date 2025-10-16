import { Button } from "@/components/ui/button";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import dynamic from "next/dynamic";
const ProfileToolTip = dynamic(
  () => import("@/components/ui/profile-tooltip"),
  {
    ssr: false,
  }
);

interface Props {
  data: IssueSheetData;
}

const StatusChangeBy = ({ data }: Props) => {
  return (
    <div className="flex justify-center items-center">
      {data.statusChangedBy ? (
        <ProfileToolTip
          trigger={
            <Button variant="link">@{data.statusChangedBy.nickName}</Button>
          }
          fullName={data.statusChangedBy?.fullName ?? ""}
          joiningDate={data.statusChangedAt}
          designation={data.statusChangedBy?.designation?.name ?? ""}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default StatusChangeBy;
