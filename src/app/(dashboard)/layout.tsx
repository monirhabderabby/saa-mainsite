import { auth } from "@/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
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

        <div className=" bg-[#F5F7FA] dark:bg-background p-0">
          <ScrollArea className="h-[calc(100vh-65px)] p-0">
            <div className="p-6">{children}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SiteLayout;
