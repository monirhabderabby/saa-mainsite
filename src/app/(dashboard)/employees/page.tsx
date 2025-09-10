import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";

const Page = async () => {
  const users = await prisma.user.findMany();

  console.log(users);
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Browse and search for employees by their ID.
            </CardDescription>
          </div>
          <Input className="max-w-[400px]" placeholder="Enter Employee ID" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default Page;
