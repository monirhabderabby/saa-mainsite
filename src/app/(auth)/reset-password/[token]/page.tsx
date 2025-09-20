import LogoImageForLogin from "@/app/(auth)/login/_components/logo-image";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ResetNowForm from "./_components/reset-password-form";

export default async function LoginPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="flex min-h-screen">
      <div className="absolute top-10 right-10 z-10">
        <ThemeToggle />
      </div>
      {/* Left side - Image */}
      <div className="hidden lg:w-3/5 md:w-1/2 bg-gray-900 lg:block relative">
        <Image
          src="/unnamed.webp"
          alt="Team meeting"
          fill
          className="object-cover blur-[.1px]"
        />
        <div className="absolute inset-0 bg-black/50 " />
      </div>

      {/* Right side - Reset form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-0 lg:w-1/2 relative">
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <LogoImageForLogin />
        </div>
        <Card className="mx-auto w-full max-w-md space-y-10 border-0 shadow-none">
          {/* Header */}
          <div className="text-center">
            <CardTitle className="text-[28px] leading-[120%] font-semibold text-gray-900 dark:text-white/90">
              Reset <span className="text-pretty">password</span>
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-gray-600 dark:text-white/60">
              Setup your new password
            </CardDescription>
          </div>

          {/* Form component */}
          <ResetNowForm token={params.token} />

          <div className="w-full flex justify-center">
            <Link href="/" className="flex items-center gap-x-2 group">
              <MoveLeft />{" "}
              <span className="group-hover:underline">Back to home</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
