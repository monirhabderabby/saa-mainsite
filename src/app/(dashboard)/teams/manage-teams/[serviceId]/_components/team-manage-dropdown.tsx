import prisma from "@/lib/prisma";
import TeamManageDropdownAction from "./team-manage-dropdown-action";

interface Props {
  teamId: string;
  teamName: string;
  serviceId: string;
}

const TeamManageDropdown = async ({ teamId, teamName, serviceId }: Props) => {
  const users = await prisma.user.findMany({
    where: {
      serviceId, // in the same service
      userTeams: { none: {} }, // not assigned to any team (empty relation)
    },
  });

  return (
    <TeamManageDropdownAction
      teamId={teamId}
      teamName={teamName}
      serviceId={serviceId}
      users={users}
    />
  );
};

export default TeamManageDropdown;
