import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AuthProps {
  children: ReactNode;
}

const AuthLayout = async ({ children }: AuthProps) => {
  const cu = await auth();

  if (cu) redirect("/");
  return <div>{children}</div>;
};

export default AuthLayout;
