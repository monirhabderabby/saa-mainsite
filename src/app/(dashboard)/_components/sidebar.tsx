"use client";

import { logoutAction } from "@/actions/auth/logout";
import LogoImageForLogin from "@/app/(auth)/login/_components/logo-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AlertModal from "@/components/ui/custom/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prisma, Role } from "@prisma/client";
import {
  Building,
  ChevronRight,
  CircleQuestionMark,
  FileText,
  Laptop,
  LayoutDashboard,
  LogOut,
  Settings,
  Sheet,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const routes = [
  {
    id: 1,
    label: "Overview",
    icon: LayoutDashboard,
    href: "/",
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
    href: "/services",
    access: ["SUPER_ADMIN"] as Role[],
  },
  {
    id: 4,
    label: "Profiles",
    icon: Laptop,
    href: "/profiles",
    access: ["SUPER_ADMIN"] as Role[],
  },
  {
    id: 5,
    label: "Teams",
    icon: Building,
    href: "/teams",
    access: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    id: 6,
    label: "Issue Sheet",
    icon: CircleQuestionMark,
    href: "/issue-sheet",
    access: [
      "ADMIN",
      "SUPER_ADMIN",
      "OPERATION_MEMBER",
      "SALES_MEMBER",
    ] as Role[],
  },
  {
    id: 7,
    label: "Update Sheet",
    icon: Sheet,
    href: "/update-sheet",
    access: [
      "ADMIN",
      "SUPER_ADMIN",
      "OPERATION_MEMBER",
      "SALES_MEMBER",
    ] as Role[],
  },

  {
    id: 8,
    label: "Settings",
    icon: Settings,
    href: "/settings",
    access: [
      "ADMIN",
      "SUPER_ADMIN",
      "OPERATION_MEMBER",
      "SALES_MEMBER",
    ] as Role[],
  },
];

interface Props {
  cu: Prisma.UserGetPayload<{
    include: {
      designation: true;
    };
  }>;
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
      <div className="fixed inset-y-0 left-0 z-50 w-60 border-r  ">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-4 flex justify-center items-center border-black/30 dark:border-white/20">
            <div className="relative h-[100px] w-[150px] flex items-center">
              <LogoImageForLogin />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-auto p-3">
            <ul className="space-y-2">
              {accessibleRoutes.map((route) => {
                const Icon = route.icon;
                const isActive =
                  route.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(route.href);

                return (
                  <li key={route.id}>
                    <Link
                      href={route.href}
                      className={`flex items-center gap-3 rounded-md px-3 text-[14px] py-2
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
          </nav>

          {/* Logout Button */}
          <div className="border-t p-3 hover:bg-gray-50 dark:hover:bg-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between gap-1 w-full cursor-pointer ">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.avif" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <h1 className="text-[14px] truncate w-36 ">
                        {cu.fullName}
                      </h1>
                      <p className="text-[12px]">{cu.designation.name}</p>
                    </div>
                  </div>
                  <ChevronRight />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
