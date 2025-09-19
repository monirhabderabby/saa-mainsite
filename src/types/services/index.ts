import { Prisma } from "@prisma/client";

export type ServiceWithTeamsAndUsers = Prisma.ServicesGetPayload<{
  include: {
    teams: {
      include: {
        userTeams: {
          include: {
            user: {
              select: {
                id: true;
                fullName: true;
                employeeId: true;
                image: true;
                email: true;
                role: true;
              };
            };
          };
        };
      };
    };
    users: {
      select: {
        id: true;
        fullName: true;
        employeeId: true;
        image: true;
        email: true;
        role: true;
      };
    };
    serviceManager: {
      select: {
        fullName: true;
      };
    };
  };
}>;

export interface ServiceStats {
  totalServices: number;
  totalTeams: number;
  totalMembers: number;
}
