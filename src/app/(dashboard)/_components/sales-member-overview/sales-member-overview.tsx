import { auth } from "@/auth";
import { redirect } from "next/navigation";

const SalesMemberOverview = async () => {
  const cu = await auth();
  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  return <div>SalesMemberOverview</div>;
};

export default SalesMemberOverview;
