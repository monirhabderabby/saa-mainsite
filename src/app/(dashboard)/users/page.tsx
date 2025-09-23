import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import UserTableContainer from "./_components/user-table-container";
const UserFilterContainer = dynamic(
  () => import("./_components/filters/users-filter-container"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const cu = await auth();
  const services = await prisma.services.findMany({
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
          <UserFilterContainer services={services ?? []} />
        </div>
      </CardHeader>

      <CardContent>
        <UserTableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
