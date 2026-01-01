import { auth } from "@/auth";
import { NewYearCelebration } from "@/components/new-year-celebration";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Topbar from "./_components/top-bar";
const Sidebar = dynamic(() => import("./_components/sidebar"), {
  ssr: false,
});

interface Props {
  children: ReactNode;
}

const SiteLayout = async ({ children }: Props) => {
  const cu = await auth();
  if (!cu) redirect("/login");

  const user = await prisma.user.findUnique({
    where: {
      id: cu.user.id,
    },
    include: {
      designation: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <>
      <div className="flex  flex-col h-screen">
        <Sidebar cu={user} />
        {/* Main Content */}
        <div className="ml-60 flex flex-1 flex-col h-full">
          {/* Top Bar */}
          <Topbar name={user.fullName as string} />

          <div className=" bg-[#F5F7FA] dark:bg-background h-[calc(100vh-64px)] overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
      <NewYearCelebration employeeId={user.employeeId} />
    </>
  );
};

export default SiteLayout;
