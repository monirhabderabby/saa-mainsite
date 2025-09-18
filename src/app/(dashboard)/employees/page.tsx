import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import EmployeeTableContainer from "./_components/employee-table-container";

const Page = async () => {
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
        <EmployeeTableContainer data={users ?? []} />
      </CardContent>
    </Card>
  );
};

export default Page;
