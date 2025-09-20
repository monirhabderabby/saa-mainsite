import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import Image from "next/image";
import ForgetPasswordWrapper from "./_components/forget-pass-wrapper";

export default function LoginPage() {
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
      <ForgetPasswordWrapper />
    </div>
  );
}
