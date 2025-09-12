import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import AddProfileDialog from "./_components/add-profile-dialog";
import ProfileCard from "./_components/profile-card";

const Page = async () => {
  const services = await prisma.profile.findMany();
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-semibold leading-none tracking-tight text-[20px]">
          {" "}
          Profiles
        </h1>

        <AddProfileDialog trigger={<Button>Create Profile</Button>} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-5">
        {services.map((s) => (
          <ProfileCard key={s.id} data={s} />
        ))}
      </div>
    </div>
  );
};

export default Page;
