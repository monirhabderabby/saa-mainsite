import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import UserTableContainer from "./_components/user-table-container";
const AddUserFilterModal = dynamic(
  () => import("./_components/filters/add-employee-filter"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const cu = await auth();
  const services = await prisma.services.findMany();
  const department = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const teams = await prisma.team.findMany();

  if (!cu || !cu.user) redirect("/login");
  return (
    <Card>
      <CardHeader className=" w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Browse and search for employees by their ID.
            </CardDescription>
          </div>
          <AddUserFilterModal
            services={services ?? []}
            teams={teams ?? []}
            departments={department ?? []}
            trigger={
              <Button variant="outline">
                <Filter /> Filter
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent>
        <UserTableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
