import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
const AddProjectModal = dynamic(
  () => import("./_components/add-project-modal"),
  {
    ssr: false,
  },
);

const Page = async () => {
  const profiles = await prisma.profile.findMany();
  const users = await prisma.user.findMany({
    where: {
      role: "SALES_MEMBER",
    },
  });

  const teams = await prisma.team.findMany({
    where: {
      service: {
        name: "FSD",
      },
    },
  });

  if (!profiles)
    throw new Error("Profiles not found. route: /tools/fsd-project");
  return (
    <Card>
      <CardHeader className=" w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>FSD Projects</CardTitle>
            <CardDescription className="mt-2">
              Manage and track all your fsd projects
            </CardDescription>
          </div>

          <AddProjectModal
            profiles={profiles}
            users={users ?? []}
            teams={teams}
          />
        </div>
      </CardHeader>

      <CardContent>Table</CardContent>
    </Card>
  );
};

export default Page;
