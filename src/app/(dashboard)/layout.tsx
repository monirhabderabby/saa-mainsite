import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./_components/sidebar";
import Topbar from "./_components/top-bar";

interface Props {
  children: ReactNode;
}

const SiteLayout = async ({ children }: Props) => {
  const cu = await auth();

  if (!cu) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar cu={cu.user} />
      {/* Main Content */}
      <div className="ml-52 flex flex-1 flex-col">
        {/* Top Bar */}
        <Topbar name={"Monir Hossain Rabby" as string} />

        <div className="p-6 bg-[#F5F7FA] min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SiteLayout;
