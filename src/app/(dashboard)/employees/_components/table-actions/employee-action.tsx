import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserWithAllIncludes } from "@/types/user";
import { Eye, MoreHorizontal, Shield, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
const AccountStatusModal = dynamic(
  () => import("../modals/add-account-status-modal"),
  {
    ssr: false,
  }
);

const AddRoleChangeModal = dynamic(
  () => import("@/components/shared/modal/add-role-change-modal"),
  {
    ssr: false,
  }
);

const ProfileView = dynamic(() => import("./profile/profile-view"), {
  ssr: false,
});

interface Props {
  data: UserWithAllIncludes;
}

const EmployeeAction = ({ data }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col w-48">
        <ProfileView
          trigger={
            <Button
              variant="ghost"
              className="justify-start w-full gap-2" // <-- key
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
          }
          user={data}
        />

        <AddRoleChangeModal
          trigger={
            <Button
              variant="ghost"
              className="justify-start w-full gap-2" // <-- key
            >
              <Shield className="w-4 h-4" />
              Change Role
            </Button>
          }
          currentRole={data.role}
          userId={data.id}
          userName={data.fullName!}
        />

        <AccountStatusModal
          data={data}
          trigger={
            <Button
              variant="ghost"
              className="justify-start w-full gap-2" // <-- key
            >
              <ShieldCheck className="w-4 h-4" />
              Change Status
            </Button>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeAction;
