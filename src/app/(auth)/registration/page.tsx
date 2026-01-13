import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import prisma from "@/lib/prisma";
import MotionProvider from "@/providers/animation/motion-provider";
import dynamic from "next/dynamic";
const RegistrationForm = dynamic(
  () => import("./_components/registration-form"),
  {
    ssr: false,
  }
);

const Page = async () => {
  const services = await prisma.services.findMany({});
  const departments = await prisma.department.findMany();

  const designations = await prisma.designations.findMany();
  return (
    <MotionProvider>
      <div className="min-h-screen flex justify-center items-center dark:bg-white/5 relative">
        <div className="absolute top-10 right-10">
          <ThemeToggle />
        </div>
        <RegistrationForm
          services={services}
          designations={designations}
          departments={departments}
        />
      </div>
    </MotionProvider>
  );
};

export default Page;
