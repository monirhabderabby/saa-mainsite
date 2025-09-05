"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/ui/custom/alert-modal";
import { logoSrc } from "@/constants/assets";
import {
  Building,
  FileStack,
  FileText,
  LayoutDashboard,
  ListRestart,
  LogOut,
  Settings,
  TableOfContents,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const routes = [
  {
    id: 1,
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: 2,
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    id: 3,
    label: "Documents",
    icon: FileText,
    href: "/dashboard/documents",
  },
  {
    id: 4,
    label: "Companies",
    icon: Building,
    href: "/dashboard/companies",
  },
  {
    id: 5,
    label: "Category",
    icon: FileStack,
    href: "/dashboard/categories",
  },
  {
    id: 6,
    label: "Content",
    icon: TableOfContents,
    href: "/dashboard/content",
  },
  {
    id: 7,
    label: "WaitList",
    icon: ListRestart,
    href: "/dashboard/waitlist",
  },
  {
    id: 8,
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

const Sidebar = () => {
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
              {routes.map((route) => {
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
