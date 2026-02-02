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
  value: number;
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
      <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </h3>
            {change && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                  isPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change}</span>
                <span className="text-slate-400 font-normal">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-[#FFC300]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#FFC300]" />
          </div>
        </div>
      </div>
    </MotionProvider>
  );
}
