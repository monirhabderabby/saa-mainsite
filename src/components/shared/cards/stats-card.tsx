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
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: StatsCardProps) {
  return (
    <MotionProvider>
      <Card
        className={cn(
          "border-border/50 bg-card/50 dark:bg-white/5 backdrop-blur-sm",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="bg-primary-green/20 p-3 rounded-lg">{icon}</div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground text-primary-yellow">
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
