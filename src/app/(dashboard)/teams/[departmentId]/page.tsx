import ServiceCard from "@/components/shared/cards/team-card";
import prisma from "@/lib/prisma";
import { ServiceStats, ServiceWithTeamsAndUsers } from "@/types/services";
import TeamStatsOverview from "../_components/team-stats-overview";

const Page = async ({ params }: { params: { departmentId: string } }) => {
  const services: ServiceWithTeamsAndUsers[] = await prisma.services.findMany({
    include: {
      teams: {
        include: {
          userTeams: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  employeeId: true,
                  image: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
      users: {
        select: {
          id: true,
          fullName: true,
          employeeId: true,
          image: true,
          email: true,
          role: true,
        },
      },
      serviceManager: {
        select: {
          fullName: true,
        },
      },
    },
    where: {
      departmentId: params.departmentId,
    },
  });

  const stats: ServiceStats = {
    totalServices: services.length,
    totalTeams: services.reduce(
      (acc, service) => acc + service.teams.length,
      0
    ),
    totalMembers: services.reduce(
      (acc, service) => acc + service.users.length,
      0
    ),
  };

  return (
    <div className="space-y-10 pb-10">
      <TeamStatsOverview stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {services.map((n) => (
          <ServiceCard key={n.id} service={n} />
        ))}
      </div>
    </div>
  );
};

export default Page;

// corrupted data is under userteam : 68dcf05a4f830e47313805c8
