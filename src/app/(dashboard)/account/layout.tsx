import { ReactNode, Suspense } from "react";
import UserProfileCard from "./_components/profile-card-sidebar/profile-card";

interface Props {
  children: ReactNode;
}

function CardSkeleton() {
  return (
    <div className="h-full max-w-sm rounded-2xl animate-pulse bg-white dark:bg-white/15 shadow-lg" />
  );
}

const AccountLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-1 gap-x-5 overflow-hidden h-full">
      <Suspense fallback={<CardSkeleton />}>
        <UserProfileCard />
      </Suspense>
      <div className="flex-1 h-full overflow-hidden">{children}</div>
    </div>
  );
};

export default AccountLayout;
