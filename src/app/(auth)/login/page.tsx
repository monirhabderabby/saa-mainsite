import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MotionProvider from "@/providers/animation/motion-provider";
import Image from "next/image";
import LoginForm from "./_components/login-form";

const Page = () => {
  return (
    <MotionProvider>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/black-logo.svg"
                width={180}
                height={57}
                alt="black logo"
              />
              <CardTitle>Sign in to your account to continue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </MotionProvider>
  );
};

export default Page;
