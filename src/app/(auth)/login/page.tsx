import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import MotionProvider from "@/providers/animation/motion-provider";
import LoginForm from "./_components/login-form";
import LogoImageForLogin from "./_components/logo-image";

const Page = () => {
  return (
    <MotionProvider>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-white/5 relative">
        <div className="absolute top-10 right-10">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md md:shadow-lg shadow-none mt-5 md:mt-0">
          <CardHeader>
            <div className="flex flex-col justify-center items-center">
              <LogoImageForLogin />
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
