"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Prisma } from "@prisma/client";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";

interface Props {
  cu: Prisma.UserGetPayload<{
    include: {
      designation: true;
    };
  }>;
}

const MobileSidebar = ({ cu }: Props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-60">
        <Sidebar cu={cu} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
