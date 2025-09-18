import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EmployeeTableContainer from "./_components/employee-table-container";

const Page = async () => {
  const cu = await auth();

  if (!cu || !cu.user) redirect("/login");
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
        <EmployeeTableContainer data={users ?? []} cuRole={cu.user.role} />
      </CardContent>
    </Card>
  );
};

export default Page;
