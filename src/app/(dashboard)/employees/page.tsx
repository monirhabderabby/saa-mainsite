import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import EmployeeTableContainer from "./_components/employee-table-container";

const Page = async () => {
  const users = await prisma.user.findMany({});

  return (
    <Card className="shadow-none dark:bg-customDark-background p-0">
      <CardContent>
        <EmployeeTableContainer data={users ?? []} />
      </CardContent>
    </Card>
  );
};

export default Page;
