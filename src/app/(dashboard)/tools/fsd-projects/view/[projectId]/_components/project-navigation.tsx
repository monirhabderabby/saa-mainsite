"use client";

import { SpotlightNavbar } from "@/components/ui/spot-light-navbar";
import { useRouter, useSearchParams } from "next/navigation";

export function ProjectNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const navItems = [
    { label: "Overview", href: "#overview" },
    { label: "Team", href: "#team" },
    { label: "Phases", href: "#phases" },
    { label: "Documents", href: "#documents" },
    { label: "Timeline", href: "#timeline" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNavClick = (item: any) => {
    const tabName = item.href.replace("#", "");
    router.push(`?tab=${tabName}`, { scroll: false });
  };

  const defaultIndex = navItems.findIndex(
    (item) => item.href.replace("#", "") === activeTab,
  );

  return (
    <div>
      <SpotlightNavbar
        items={navItems}
        onItemClick={handleNavClick}
        defaultActiveIndex={defaultIndex !== -1 ? defaultIndex : 0}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
