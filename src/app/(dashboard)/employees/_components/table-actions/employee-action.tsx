import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { Eye } from "lucide-react";
import { ProfileView } from "./profile/profile-view";

interface Props {
  data: User;
}

const EmployeeAction = ({}: Props) => {
  return (
    <ProfileView
      trigger={
        <Button size="icon" variant="ghost">
          <Eye />
        </Button>
      }
    />
  );
};

export default EmployeeAction;
