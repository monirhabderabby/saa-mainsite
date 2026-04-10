import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ComplainsContainer from "./_components/complains-container";

const Page = async () => {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  return <ComplainsContainer />;
};

export default Page;
