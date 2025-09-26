import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MotionProvider from "@/providers/animation/motion-provider";
import type React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  className,
  valueClassName,
}: StatsCardProps) {
  return (
    <MotionProvider>
      <Card
        className={cn(
          "border-border/50  dark:bg-white/5 bg-background backdrop-blur-sm",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary dark:text-white">
            {title}
          </CardTitle>
          {icon && <div className=" p-3 rounded-lg">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold text-foreground text-primary-yellow",
              valueClassName
            )}
          >
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </MotionProvider>
  );
}
