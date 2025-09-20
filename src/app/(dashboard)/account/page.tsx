import { Suspense } from "react";
import UserProfileCard from "./_components/profile-card";

function CardSkeleton() {
  return (
    <div className="h-[calc(100vh-120px)] w-full max-w-sm rounded-2xl animate-pulse bg-white shadow-lg" />
  );
}

const Page = async () => {
  return (
    <div className="flex h-[calc(100vh-120px)] ">
      <Suspense fallback={<CardSkeleton />}>
        <UserProfileCard />
      </Suspense>
    </div>
  );
};

export default Page;
