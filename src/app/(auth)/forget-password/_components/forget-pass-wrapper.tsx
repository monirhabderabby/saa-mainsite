"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import * as ResizablePanel from "@/components/ui/resizable-panel";
import MotionProvider from "@/providers/animation/motion-provider";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import LogoImageForLogin from "../../login/_components/logo-image";
const ForgetPasswordForm = dynamic(() => import("./forget-password-form"), {
  ssr: false,
});
const ForgetPasswordSubmitted = dynamic(
  () => import("./forget-password-submitted"),
  {
    ssr: false,
  }
);

const ForgetPasswordWrapper = () => {
  const [email, setEmail] = useState("monir.bdcalling@gmail.com");
  const [state, setState] = useState<"submitted" | "form">("form");

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-0 lg:w-1/2 relative">
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <LogoImageForLogin />
      </div>
      <Card className="mx-auto w-full max-w-md space-y-10 border-0 shadow-none">
        {/* Form component */}
        <ResizablePanel.Root value={state}>
          <ResizablePanel.Content value="form" className="p-5">
            <MotionProvider>
              <div className="space-y-10">
                <div className="text-center">
                  <CardTitle className="text-[28px] leading-[120%] font-semibold text-gray-900 dark:text-white/90">
                    Reset <span className="text-pretty">password</span>
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-600 dark:text-white/60">
                    Enter your email address to receive magic link
                  </CardDescription>
                </div>
                <ForgetPasswordForm
                  onSuccess={(email) => {
                    setEmail(email);
                    setState("submitted");
                  }}
                />
              </div>
            </MotionProvider>
          </ResizablePanel.Content>
          <ResizablePanel.Content value="submitted" className="p-5">
            <ForgetPasswordSubmitted email={email} />;
          </ResizablePanel.Content>
        </ResizablePanel.Root>

        <div className="w-full flex justify-center">
          {/* <Link href="/" className="flex items-center gap-x-2 group">
              <MoveLeft />{" "}
              <span className="group-hover:underline">Back to home</span>
            </Link> */}
          <Button
            asChild
            className="flex items-center justify-center gap-2 text-gray-600  transition-colors w-full hover:text-blue-700"
            variant="link"
          >
            <Link href="/">
              {/* <ArrowLeft className="w-4 h-4" /> */}
              Back to home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ForgetPasswordWrapper;
