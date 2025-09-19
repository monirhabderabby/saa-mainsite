import { auth } from "@/auth";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ProjectManagerOverviewTeam from "./project-manager-overview-team";

function CardSkeleton() {
  return <Skeleton className="bg-background h-[250px]" />;
}

const ProjectManagerOverview = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const service = await prisma.services.findFirst({
    where: {
      serviceManagerId: cu.user.id,
    },
    include: {
      teams: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!service) notFound();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {service.teams.map((team) => (
        <Suspense fallback={<CardSkeleton />} key={team.id}>
          <ProjectManagerOverviewTeam teamId={team.id} teamName={team.name} />
        </Suspense>
      ))}
    </div>
  );
};

export default ProjectManagerOverview;
