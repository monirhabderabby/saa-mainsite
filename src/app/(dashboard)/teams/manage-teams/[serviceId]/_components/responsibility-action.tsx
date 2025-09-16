const AddResponsibilityModal = dynamic(
  () => import("@/components/shared/modal/add-responsibility-modal"),
  {
    ssr: false,
  }
);
import { Button } from "@/components/ui/button";
import { TeamResponsibility } from "@prisma/client";
import dynamic from "next/dynamic";

interface Props {
  teamId: string;
  teamName: string;
  userId: string;
  responsibility: TeamResponsibility;
}

const ResponsibilityAction = ({
  teamId,
  teamName,
  userId,
  responsibility,
}: Props) => {
  return (
    <AddResponsibilityModal
      trigger={
        <Button variant="ghost" size="sm" className="text-sm w-full">
          Responsibility
        </Button>
      }
      teamId={teamId}
      userId={userId}
      teamName={teamName}
      responsibility={responsibility}
    />
  );
};

export default ResponsibilityAction;
