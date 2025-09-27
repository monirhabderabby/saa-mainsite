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
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
const FilterContainer = dynamic(
  () => import("./_components/filter-container"),
  {
    ssr: false,
  }
);
const TableContainer = dynamic(
  () => import("./_components/tables/table-container"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu?.user || !cu.user.id) redirect("/login");

  const permission = await prisma.permissions.findFirst({
    where: {
      userId: cu.user.id,
      name: "UPDATE_SHEET",
    },
    select: {
      isMessageCreateAllowed: true,
    },
  });

  const isWriteAccess = permission?.isMessageCreateAllowed ?? false;
  const currentUsers = await prisma.userTeam.findFirst({
    where: {
      userId: cu.user.id,
    },
    include: {
      team: {
        include: {
          service: true,
        },
      },
    },
  });

  return (
    <Card className="shadow-none ">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle>Entries</CardTitle>
            <CardDescription>
              All update entries in one place — apply filters to quickly find
              what you need.
            </CardDescription>
          </div>
          <div className="flex items-center gap-5">
            <FilterContainer userId={cu.user.id} />
            {isWriteAccess && (
              <Button effect="gooeyLeft" asChild>
                <Link href="/update-sheet/add-entry" className="w-full">
                  Add Entry
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TableContainer
          currentUserRole={cu.user.role}
          currentUserId={cu.user.id}
          currentUserTeam={currentUsers}
        />
      </CardContent>
    </Card>
  );
};

export default Page;
