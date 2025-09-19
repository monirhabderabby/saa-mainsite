import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const OperationTeamOverview = dynamic(
  () => import("./team-overview/operation-team-overview"),
  {
    ssr: false,
  }
);

const ProjectManagerOverview = dynamic(
  () => import("./project-manager-overview/project-manager-overview"),
  {
    ssr: false,
  }
);

const OperationMemberOverview = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const isManager = await prisma.services.findFirst({
    where: {
      serviceManagerId: cu.user.id,
    },
  });

  if (isManager) {
    return <ProjectManagerOverview />;
  }
  return <OperationTeamOverview />;
};

export default OperationMemberOverview;
