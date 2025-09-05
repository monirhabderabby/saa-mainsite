import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Button asChild>
        <Link href="/registration">Get Started</Link>
      </Button>
    </div>
  );
}
