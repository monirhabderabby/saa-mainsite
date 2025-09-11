import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const Page = ({}: { params: { token: string } }) => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <Card className="min-w-[300px] shadow-none">
        <CardHeader>
          <CardTitle className="text-center">Verification Completed</CardTitle>
          <CardDescription className="text-center">
            Congratulations, your identity has been verified.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center items-center">
          <Image
            src="/black-logo.svg"
            width={120}
            height={47}
            alt="black logo"
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
