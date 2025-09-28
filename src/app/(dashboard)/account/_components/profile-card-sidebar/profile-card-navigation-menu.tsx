"use client";
import { Role } from "@prisma/client";
import { Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    id: 1,
    label: "Personal Information",
    icon: User,
    href: "/account",
    access: [
      "ADMIN",
      "OPERATION_MEMBER",
      "SALES_MEMBER",
      "SUPER_ADMIN",
    ] as Role[],
  },
  {
    id: 2,
    label: "Security",
    icon: Shield,
    href: "/account/security",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
];
const ProfileCardNavigationMenu = () => {
  const pathname = usePathname();
  return (
    <div>
      <ul className="space-y-3">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive =
            route.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(route.href);

          return (
            <li key={route.id}>
              <Link
                href={route.href}
                className={`flex items-center gap-3 rounded-md px-3 text-[14px] h-[40px]
          ${
            isActive
              ? "bg-primary dark:bg-customYellow-primary/10 text-primary-foreground dark:text-customYellow-primary"
              : "text-muted-foreground  hover:bg-muted hover:text-foreground dark:hover:text-customYellow-primary"
          }
        `}
              >
                <Icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProfileCardNavigationMenu;
