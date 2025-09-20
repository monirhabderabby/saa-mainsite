"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
const PasswordResetComponentForm = dynamic(
  () => import("./password-reset-component-form"),
  {
    ssr: false,
  }
);

const PasswordResetComponent = () => {
  const [state, setState] = useState<"form" | "empty">("empty");
  return (
    <Card className="w-full h-full dark:bg-white/5">
      <CardHeader>
        <section className="flex items-center justify-between">
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account password</CardDescription>
          </div>
          {state == "form" && (
            <Button variant="ghost" onClick={() => setState("empty")}>
              Back Now
            </Button>
          )}
        </section>
      </CardHeader>

      <CardContent className="h-full ">
        {state == "empty" ? (
          // Empty state with icon, message, and button
          <div className="h-full  flex justify-center items-center">
            <div className="flex flex-col items-center  text-center space-y-4 py-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Change Password</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Update your password to keep your account secure. You&apos;ll
                  need to enter your current password.
                </p>
              </div>
              <Button onClick={() => setState("form")} className="w-full">
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <PasswordResetComponentForm onCLose={() => setState("empty")} />
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordResetComponent;
