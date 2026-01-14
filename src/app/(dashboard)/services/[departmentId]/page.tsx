import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";

import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
const ServiceCard = dynamic(() => import("./_components/service-card"), {
  ssr: false,
});
const AddServiceDialog = dynamic(
  () => import("./_components/add-service-modal"),
  {
    ssr: false,
  }
);

const Page = async ({ params }: { params: { departmentId: string } }) => {
  const services = await prisma.services.findMany({
    include: {
      designations: {
        select: {
          id: true,
          name: true,
        },
      },
      department: true,
    },
    where: {
      departmentId: params.departmentId,
    },
  });

  return (
    <div className="space-y-8 pb-10 p-5 md:p-0">
      <div className="flex justify-between items-center  gap-x-5 h-full">
        <div className="space-y-2">
          <CardTitle>Service Overview</CardTitle>
          <CardDescription className="max-w-[600px] mt-2 text-xs md:text-sm">
            Monitor your services and designations at a glance
          </CardDescription>
        </div>

        <AddServiceDialog
          departmentId={params.departmentId}
          trigger={<Button>Create Service</Button>}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3   gap-5">
        {services.map((s) => (
          <ServiceCard key={s.id} data={s} />
        ))}
      </div>

      {/* <div className="space-y-4">
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
      </div> */}
    </div>
  );
};

export default Page;
