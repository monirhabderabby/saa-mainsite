import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PersonalInformation from "./_components/personal-information/personal-information";

const Page = async () => {
  const cu = await auth();
  if (!cu || !cu.user.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: {
      id: cu.user.id,
    },
  });

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full ">
      <PersonalInformation user={user} />
    </div>
  );
};

export default Page;
