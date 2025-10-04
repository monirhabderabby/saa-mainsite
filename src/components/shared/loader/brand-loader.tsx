import { logoSrcBlack } from "@/constants/assets";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      <Image src={logoSrcBlack} alt="logo" width={180} height={57} />
      <div className="flex flex-col justify-center items-center">
        <div className="loader" />
        <div className={cn("mt-2 text-primary-black")}>{message}</div>
      </div>
    </div>
  );
};

export default BrandLoader;
