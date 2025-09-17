import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import AddServiceDialog from "./_components/add-service-modal";
import ServiceCard from "./_components/service-card";

const Page = async () => {
  const services = await prisma.services.findMany({
    include: {
      designations: {
        select: {
          id: true,
        },
      },
    },
  });
  return (
    <div>
      <div className="flex justify-between">
        <h1 className="font-semibold leading-none tracking-tight"> Services</h1>

        <AddServiceDialog trigger={<Button>Create Service</Button>} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-5">
        {services.map((s) => (
          <ServiceCard key={s.id} data={s} />
        ))}
      </div>
    </div>
  );
};

export default Page;
