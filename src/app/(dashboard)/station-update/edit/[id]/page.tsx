import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreateStationUpdateForm from "../../new/_components/station-update-form";

const Page = async ({ params }: { params: { id: string } }) => {
  const profiles = await prisma.profile.findMany();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
    },
    where: {
      role: "SALES_MEMBER",
    },
  });

  const data = await prisma.stationUpdate.findUnique({
    where: {
      id: params.id,
    },
    include: {
      assignments: {
        include: {
          user: true,
          profiles: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  });

  if (!data) notFound();

  return (
    <div>
      <CreateStationUpdateForm
        profiles={profiles ?? []}
        users={users ?? []}
        initialData={data}
      />
    </div>
  );
};

export default Page;
