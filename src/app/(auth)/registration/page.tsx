import prisma from "@/lib/prisma";
import MotionProvider from "@/providers/animation/motion-provider";
import RegistrationForm from "./_components/registration-form";

const Page = async () => {
  const services = await prisma.services.findMany({
    select: {
      name: true,
      id: true,
    },
  });

  const designations = await prisma.designations.findMany();
  return (
    <MotionProvider>
      <div className="h-screen flex justify-center items-center">
        <RegistrationForm services={services} designations={designations} />
      </div>
    </MotionProvider>
  );
};

export default Page;
