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
import { redirect } from "next/navigation";
import AddUserFilterModal from "./_components/filters/add-employee-filter";
import UserTableContainer from "./_components/user-table-container";

const Page = async () => {
  const cu = await auth();
  const services = await prisma.services.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const department = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
    },
  });

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
            departments={department}
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
