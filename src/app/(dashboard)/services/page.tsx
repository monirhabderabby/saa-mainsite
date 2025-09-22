import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { DesignationCard } from "./_components/designation-card";
import ServiceCard from "./_components/service-card";
const AddServiceDialog = dynamic(
  () => import("./_components/add-service-modal"),
  {
    ssr: false,
  }
);

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

  const designations = await prisma.designations.findMany({
    include: {
      users: {
        select: {
          id: true,
        },
      },
      service: {
        select: {
          name: true,
        },
      },
    },
  });
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor your services and designations at a glance
          </p>
        </div>

        <AddServiceDialog trigger={<Button>Create Service</Button>} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-5">
        {services.map((s) => (
          <ServiceCard key={s.id} data={s} />
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Designations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designations.map((designation) => (
            <DesignationCard
              key={designation.id}
              designationName={designation.name}
              totalMembers={designation.users.length}
              serviceName={designation.service.name}
              className="dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
