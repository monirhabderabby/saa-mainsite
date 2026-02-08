"use client";

import MotionProvider from "@/providers/animation/motion-provider";
import {
  Activity,
  CheckCircle,
  DollarSign,
  FolderKanban,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type IconKey = keyof typeof iconMap;

interface Props {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: IconKey;
}

const iconMap = {
  folder: FolderKanban,
  activity: Activity,
  checkCircle: CheckCircle,
  doller: DollarSign,
} as const;

export default function ProjectStatsCard({
  title,
  value,
  change,
  changeType,
  icon,
}: Props) {
  const isPositive = changeType === "positive";
  const Icon = iconMap[icon];

  return (
    <MotionProvider>
      <div
        className="
          rounded-2xl p-6 border transition-all duration-300
          bg-white border-slate-100
          hover:shadow-lg hover:shadow-slate-200/50

          dark:bg-slate-900/20 dark:border-slate-800
          dark:hover:shadow-black/40
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-slate-500 dark:text-slate-400">
              {title}
            </p>

            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </h3>

            {change && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change}</span>
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  vs last month
                </span>
              </div>
            )}
          </div>

          <div
            className="
              w-12 h-12 rounded-xl flex items-center justify-center
              bg-[#FFC300]/10 dark:bg-[#FFC300]/15
            "
          >
            <Icon className="w-6 h-6 text-[#FFC300]" />
          </div>
        </div>
      </div>
    </MotionProvider>
  );
}
