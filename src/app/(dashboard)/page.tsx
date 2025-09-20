import { auth } from "@/auth";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const SalesMemberOverview = dynamic(
  () => import("./_components/sales-member-overview/sales-member-overview"),
  {
    ssr: false,
  }
);
const OperationMemberOverview = dynamic(
  () =>
    import("./_components/operation-member-overview/operation-member-overview"),
  {
    ssr: false,
  }
);
const SuperAdminOverViewContainer = dynamic(
  () =>
    import("./_components/super-admin-overview/super-admin-overview-container"),
  {
    ssr: false,
  }
);

export default async function Home() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const role = cu.user.role;

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return <SuperAdminOverViewContainer />;
  } else if (role === "OPERATION_MEMBER") {
    return <OperationMemberOverview />;
  }
  return <SalesMemberOverview />;
}
