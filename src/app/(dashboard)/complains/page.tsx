import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ComplainsContainerForAdmin from "./_components/complain-container-for-admin";
import ComplainsContainer from "./_components/complains-container";

const Page = async () => {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  if (session.user.email === "monir.bdcalling@gmail.com") {
    return <ComplainsContainerForAdmin isAdmin />;
  }

  return <ComplainsContainer />;
};

export default Page;
