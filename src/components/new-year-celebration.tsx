"use client";

import LogoImageForLogin from "@/app/(auth)/login/_components/logo-image";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function NewYearCelebration() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the celebration
    const hasSeenCelebration = Cookies.get("has-seen-new-year-2025");

    if (!hasSeenCelebration) {
      setIsVisible(true);

      // Trigger confetti
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Mark as seen
      Cookies.set("has-seen-new-year-2025", "true", { expires: 365 });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-500">
      <div className="relative max-w-md w-full mx-4 bg-background border rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="mb-6 flex justify-center">
          <LogoImageForLogin />
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-2 ">
          Happy New Year!
        </h2>

        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          At ScaleUp Ads Agency, our growth is powered by your passion,
          creativity, and commitment. Thank you for being part of our
          journey—here’s to a year of innovation, success, and new possibilities
        </p>

        <Button
          className="w-full h-12 text-lg font-medium rounded-xl"
          onClick={() => setIsVisible(false)}
        >
          Let&apos;s Celebrate
        </Button>
      </div>
    </div>
  );
}
