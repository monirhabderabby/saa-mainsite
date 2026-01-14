"use client";

import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Smartphone, Tablet, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  employeeId: string;
}

export function MobileFeatureUnlock({ employeeId }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!employeeId) return;

    const cookieKey = `has-seen-mobile-feature-${employeeId}`;
    const hasSeen = Cookies.get(cookieKey);

    if (!hasSeen) {
      setIsVisible(true);
      Cookies.set(cookieKey, "true", {
        expires: 365,
        sameSite: "lax",
      });
    }
  }, [employeeId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 animate-in zoom-in-95">
        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content */}
          <div className="flex flex-col justify-center gap-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC300] bg-[#FFC300]/20 px-3 py-1 w-fit">
              <Zap className="h-4 w-4 text-[#02AB2D]" />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                New Update
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">
              SAA Portal — Now on Mobile
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use SAA anytime, anywhere. The portal is now fully optimized for
              mobile and tablet devices.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Smartphone className="h-5 w-5 text-[#02AB2D]" />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Smooth experience on mobile & tablet
                </span>
              </div>
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-[#02AB2D]" />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Touch-friendly and easy to navigate
                </span>
              </div>
              <div className="flex gap-3">
                <Tablet className="h-5 w-5 text-[#02AB2D]" />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  All features on any screen size
                </span>
              </div>
            </div>

            {/* CTA */}
            <Button
              className="mt-4 h-11 w-full sm:w-fit rounded-xl bg-[#FFC300] hover:bg-[#E6B000] text-black font-semibold"
              onClick={() => setIsVisible(false)}
            >
              Use SAA on Mobile
            </Button>
          </div>

          {/* Device Mockup */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-60 h-96">
              <div className="absolute inset-0 rounded-3xl bg-slate-900 border-8 border-slate-800 shadow-xl overflow-hidden">
                <div className="absolute inset-8 rounded-2xl bg-white flex flex-col">
                  <div className="h-5 bg-slate-900 rounded-b-2xl mx-auto w-28" />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-10 rounded bg-[#FFC300]" />
                      <div className="h-10 rounded bg-slate-100" />
                      <div className="h-10 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-[#FFC300]/30 to-[#02AB2D]/30 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
