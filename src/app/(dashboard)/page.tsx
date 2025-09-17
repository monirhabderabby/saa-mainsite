import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import SuperAdminOverViewContainer from "./_components/super-admin-overview/super-admin-overview-container";

export default async function Home() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const role = cu.user.role;

  if (role === "SUPER_ADMIN") {
    return <SuperAdminOverViewContainer />;
  }
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Button asChild>
        <Link href="/registration">Get Started</Link>
      </Button>
    </div>
  );
}
