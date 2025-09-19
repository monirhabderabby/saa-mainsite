import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const AddFilterUpdateSheetEntries = dynamic(
  () => import("./add-filter-update-sheet-entries"),
  {
    ssr: false,
  }
);

interface Props {
  userId: string;
}

const FilterContainer = async ({ userId }: Props) => {
  const profiles = await prisma.profile.findMany();

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      serviceId: true,
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!currentUser) redirect("/login");

  const isManagement = currentUser.service?.name === "Management";
  return (
    <div>
      <AddFilterUpdateSheetEntries
        currentUserServiceId={
          isManagement ? undefined : (currentUser.serviceId ?? "")
        }
        profiles={profiles ?? []}
        trigger={
          <Button variant="outline">
            <Filter /> Filter
          </Button>
        }
      />
    </div>
  );
};

export default FilterContainer;
