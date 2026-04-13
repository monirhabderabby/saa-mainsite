import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
const CreateStationUpdateForm = dynamic(
  () => import("./_components/station-update-form"),
  {
    ssr: false,
  },
);

const Page = async () => {
  const profiles = await prisma.profile.findMany();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
    },
    where: {
      role: {
        in: ["ADMIN", "SALES_MEMBER"],
      },
    },
  });

  return (
    <div>
      <CreateStationUpdateForm profiles={profiles ?? []} users={users ?? []} />
    </div>
  );
};

export default Page;
