// app/profiles/page.tsx
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import ProfileContainer from "./_components/profile-container";
import ProfileStatsoverview from "./_components/stats/stats-overview";

const AddProfileDialog = dynamic(
  () => import("./_components/add-profile-dialog"),
  { ssr: false }
);

const Page = async () => {
  const profiles = await prisma.profile.findMany({
    include: {
      updateSheets: true,
      issueSheets: true,
    },
  });

  // Map counts manually since MongoDB doesn't support `_count`
  const profilesWithStats = profiles.map((p) => {
    const deliveryCount = p.updateSheets.filter(
      (u) => u.updateTo === "DELIVERY" && u.tlId && !u.doneById
    ).length;

    const updatesCount = p.updateSheets.filter(
      (p) => !p.doneById && p.updateTo !== "DELIVERY"
    ).length;
    const issuesCount = p.issueSheets.length;
    const wipCount = p.issueSheets.filter((i) => i.status === "wip").length;

    return {
      ...p,
      stats: {
        delivery: deliveryCount,
        updates: updatesCount,
        issues: issuesCount,
        wip: wipCount,
      },
    };
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold leading-none tracking-tight text-[20px]">
          Profiles
        </h1>
        <AddProfileDialog trigger={<Button>Create Profile</Button>} />
      </div>

      <ProfileStatsoverview />

      {/* Pass to container (client search handled with Zustand + Fuse.js) */}
      <ProfileContainer profiles={profilesWithStats} />
    </div>
  );
};

export default Page;
