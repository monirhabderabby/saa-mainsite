import { Button } from "@/components/ui/button";
import { UserWithAllIncludes } from "@/types/user";
import { Eye } from "lucide-react";
import { ProfileView } from "./profile/profile-view";

interface Props {
  data: UserWithAllIncludes;
}

const EmployeeAction = ({ data }: Props) => {
  return (
    <ProfileView
      trigger={
        <Button size="icon" variant="ghost">
          <Eye />
        </Button>
      }
      user={data}
    />
  );
};

export default EmployeeAction;
