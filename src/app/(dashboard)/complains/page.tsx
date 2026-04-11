import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ComplainsContainerForAdmin from "./_components/complain-container-for-admin";
import ComplainsContainer from "./_components/complains-container";

const Page = async () => {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const loggedinUserid = session.user.id;

  const isComplaintManager = await prisma.complaintManager.findFirst({
    where: {
      userId: loggedinUserid,
    },
  });

  if (!isComplaintManager) {
    return <ComplainsContainer />;
  } else {
    return <ComplainsContainerForAdmin isAdmin />;
  }
};

export default Page;
