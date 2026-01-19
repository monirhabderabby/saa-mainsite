import { auth } from "@/auth";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import TanstackProvider from "@/providers/tanstack/tanstack-provider";
import { ThemeProvider } from "@/providers/theme/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Raleway } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

import "@/lib/cron/station";
import prisma from "@/lib/prisma";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ScaleUp Ads Agency Portal",
  description:
    "Internal portal for managing issues, updates, and team activities at ScaleUp Ads Agency.",
  keywords:
    "ScaleUp Ads, internal portal, issue management, update tracking, team management, workflow",
  authors: [
    {
      name: "Monir Hossain Rabby",
      url: "https://github.com/monirhabderabby",
    },
  ],
  robots: "noindex, nofollow",
  metadataBase: new URL("https://github.com/monirhabderabby"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const userTeams = await prisma.userTeam.findMany({
    where: {
      team: {
        serviceId: "68db8a01d46e9cd778a33acc",
      },
    },
    include: {
      team: true,
    },
  });
  console.log("UserTeams blocking delete:", userTeams);

  return (
    <html lang="en">
      <body
        className={cn(raleway.className, "antialiased bg-background relative")}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TanstackProvider>
              <EdgeStoreProvider>{children}</EdgeStoreProvider>
              <p className="absolute bottom-1 right-7 text-[12px]">
                Beta v1.0.8
              </p>
            </TanstackProvider>
          </ThemeProvider>{" "}
          <Toaster richColors />
          <NextTopLoader showSpinner={false} color="#FFC300" />
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID!} />
        </SessionProvider>
      </body>
    </html>
  );
}
