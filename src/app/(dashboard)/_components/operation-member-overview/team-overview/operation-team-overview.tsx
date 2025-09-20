import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const IssueOpenStatus = dynamic(
  () => import("../project-manager-overview/isse-open-stats"),
  {
    ssr: false,
  }
);
const IssueDoneStats = dynamic(
  () => import("../project-manager-overview/issue-done-stats"),
  {
    ssr: false,
  }
);
const WipStats = dynamic(
  () => import("../project-manager-overview/wip-stats"),
  {
    ssr: false,
  }
);

const OperationTeamOverview = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const userTeam = await prisma.userTeam.findFirst({
    where: {
      userId: cu.user.id,
    },
  });

  if (!userTeam?.teamId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-gray-300 dark:border-gray-300/5 bg-gray-50 dark:bg-gray-50/5 text-center p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white/70">
          No Team Assigned
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          You’re not assigned to any team yet. Once your admin assigns you, your
          stats will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <IssueOpenStatus teamId={userTeam.teamId} />
      <WipStats teamId={userTeam.teamId} />
      <IssueDoneStats teamId={userTeam.teamId} />
    </div>
  );
};

export default OperationTeamOverview;
