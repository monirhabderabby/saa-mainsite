import prisma from "@/lib/prisma";
import CreateStationUpdateForm from "./_components/station-update-form";

const Page = async () => {
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
  return (
    <div>
      <CreateStationUpdateForm profiles={profiles ?? []} users={users ?? []} />
    </div>
  );
};

export default Page;
