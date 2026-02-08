"use client";

import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { Prisma } from "@prisma/client";
import MobileSidebar from "./mobile-sidebar";

interface Props {
  name: string;
  cu: Prisma.UserGetPayload<{
    include: {
      designation: true;
    };
  }>;
}

const Topbar = ({ name, cu }: Props) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <MobileSidebar cu={cu} />

        <div>
          <h1 className="text-lg font-semibold">SAA (Dashboard)</h1>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
      </div>

      <ThemeToggle />
    </header>
  );
};

export default Topbar;
