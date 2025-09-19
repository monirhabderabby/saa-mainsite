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
import FilterContainer from "./_components/filter-container";
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
        <TableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
