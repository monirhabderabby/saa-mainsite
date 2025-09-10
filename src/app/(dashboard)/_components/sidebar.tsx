"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import { logoSrc } from "@/constants/assets";
import { Role } from "@prisma/client";
import {
  Building,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ExtendedUser } from "../../../../next-auth-d";

const routes = [
  {
    id: 1,
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    access: [
      "ADMIN",
      "OPERATION_MEMBER",
      "SALES_MEMBER",
      "SUPER_ADMIN",
    ] as Role[],
  },
  {
    id: 2,
    label: "Employees",
    icon: Users,
    href: "/employees",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    id: 3,
    label: "Services",
    icon: FileText,
    href: "/dashboard/services",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    id: 4,
    label: "Teams",
    icon: Building,
    href: "/dashboard/teams",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },

  {
    id: 8,
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
];

interface Props {
  cu: ExtendedUser;
}

const Sidebar = ({ cu }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();

  const onLogout = () => {
    setIsLoading(true);
    startTransition(() => {
      logoutAction().then((res) => {
        if (res?.success) return;

        if (res?.message) {
          toast.error(res?.message);
        }
      });
    });
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  // inside Sidebar component, before return
  const accessibleRoutes = routes.filter((route) =>
    route.access.includes(cu.role)
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-50 w-52 border-r bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-4 flex justify-center items-center bg-black">
            <div className="relative h-[100px] w-[150px]">
              <Image src={logoSrc} alt="logo" fill />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-auto p-3">
            <ul className="space-y-2">
              {accessibleRoutes.map((route) => {
                const Icon = route.icon;
                const isActive =
                  route.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(route.href);

                return (
                  <li key={route.id}>
                    <Link
                      href={route.href}
                      className={`flex items-center gap-3 rounded-md px-3 text-[14px] py-2
          ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          </nav>

          {/* Logout Button */}
          <div className="border-t p-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-primary hover:text-primary/80"
              onClick={() => setOpen(true)}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onLogout}
        loading={isPending || isLoading}
        title="Are you sure you want to log out?"
        message="You will be signed out of your account and need to log in again to continue."
      />
    </>
  );
};

export default Sidebar;
