import { User } from "@prisma/client";

import { AccountStatusBadge } from "@/components/ui/custom/account-status-badge";

interface Props {
  data: User;
}

const AccountStatusForm = ({ data }: Props) => {
  return (
    <>
      <AccountStatusBadge status={data.accountStatus} />
    </>
  );
};

export default AccountStatusForm;
