import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

const Page = async () => {
  const department = await prisma.department.findMany();

  return (
    <div className="grid grid-cols-2 gap-10">
      {department.map((item) => (
        <Card className="" key={item.id}>
          <CardHeader>
            <div className="h-[300px] w-full  relative rounded-lg">
              <Image
                src="/unnamed.webp"
                fill
                alt={item.name}
                className="rounded-lg"
              />
              <div className="bg-black/50 absolute inset-0" />
              <div className="absolute inset-0 z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white flex flex-col items-center">
                <h1 className="text-[40px] font-bold text-primary-yellow">
                  {item.name}
                </h1>

                <p className="text-[20px]">Department</p>
              </div>
            </div>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild variant="outline">
              <Link href={`/teams/${item.id}`}>Enter</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Page;
