import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import dynamic from "next/dynamic";
const EmployeeTableContainer = dynamic(
  () => import("../_components/employee-table-container"),
  {
    ssr: false,
  }
);

interface Props {
  curentUserRole: Role;
}

const EmployeementServerFetch = async ({ curentUserRole }: Props) => {
  const users = await prisma.user.findMany({
    include: {
      service: true,
      permissions: true,
      designation: true,
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  });

  return (
    <Card className="shadow-none ">
      <CardContent>
        <EmployeeTableContainer data={users ?? []} cuRole={curentUserRole} />
      </CardContent>
    </Card>
  );
};

export default EmployeementServerFetch;
