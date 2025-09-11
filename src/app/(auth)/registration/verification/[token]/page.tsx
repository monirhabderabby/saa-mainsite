// app/verify/[token]/page.tsx
import { CheckIcon } from "@/components/checkIcon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfettiFireworks } from "@/components/ui/custom/confetti-fireworks";
import prisma from "@/lib/prisma";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Verify user by token (server-side)
 */
async function verifyUser(
  token: string
): Promise<{ message: string; verified: boolean }> {
  try {
    const verification = await prisma.userVerification.findUnique({
      where: { token },
    });

    if (!verification) {
      return { message: "Invalid verification link.", verified: false };
    }

    if (verification.expireOn < new Date()) {
      return {
        message: "This verification link has expired.",
        verified: false,
      };
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    });

    // Delete the verification record to prevent reuse
    await prisma.userVerification.delete({
      where: { token },
    });

    return {
      message: "Congratulations, your email has been verified.",
      verified: true,
    };
  } catch (err) {
    console.error("Verification error:", err);
    return {
      message: "Something went wrong. Please try again.",
      verified: false,
    };
  }
}

const Page = async ({ params }: { params: { token: string } }) => {
  const { token } = params;
  const { message, verified } = await verifyUser(token);

  return (
    <div className="w-full min-h-screen flex justify-center items-center relative">
      {/* 🎉 Confetti runs only if verified */}
      <ConfettiFireworks run={verified} />

      <Card className="min-w-[300px] shadow-none">
        <CardHeader className="pb-5">
          {verified && (
            <div className="w-full flex justify-center">
              <CheckIcon
                delay={0.3}
                className="h-7 w-7 bg-green-500 rounded-full text-white p-1"
              />
            </div>
          )}
          <CardTitle className="text-center pt-3">Verification</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>

          <div className="w-full flex justify-center">
            <Button asChild effect="hoverUnderline" variant="link">
              <Link
                href="/login"
                className="flex items-center gap-x-2 text-[14px] group"
              >
                <MoveLeft />
                <span>Back to login</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-center items-center pb-5">
          <Image
            src="/black-logo.svg"
            width={120}
            height={37}
            alt="black logo"
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
