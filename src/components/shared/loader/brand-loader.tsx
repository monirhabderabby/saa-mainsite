import LogoImageForLogin from "@/app/(auth)/login/_components/logo-image";
import { cn } from "@/lib/utils";

interface Props {
  message: string;
}

const BrandLoader = ({ message }: Props) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col justify-start pt-[180px] md:pt-[200px] lg:pt-[230px] items-center  gap-y-3 z-50"
      )}
    >
      <LogoImageForLogin />
      <div className="flex flex-col justify-center items-center">
        <div className="loader" />
        <div className={cn("mt-2 text-primary-black")}>{message}</div>
      </div>
    </div>
  );
};

export default BrandLoader;
