import { Suspense } from "react";
import PasswordResetComponent from "./_components/password-reset-component";
import UserProfileCard from "./_components/profile-card";

function CardSkeleton() {
  return (
    <div className="h-[calc(100vh-120px)] w-full max-w-sm rounded-2xl animate-pulse bg-white shadow-lg" />
  );
}

const Page = async () => {
  return (
    <div className="flex h-full gap-x-5">
      <Suspense fallback={<CardSkeleton />}>
        <UserProfileCard />
      </Suspense>
      <PasswordResetComponent />
    </div>
  );
};

export default Page;
