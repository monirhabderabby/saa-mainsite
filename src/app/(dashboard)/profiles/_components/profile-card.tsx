"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ProfileCardAction = dynamic(() => import("./profile-card-action"), {
  ssr: false,
});

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
const ProfileCard = ({ data }: Props) => {
  return (
    <Card className="bg-card border-border transition-colors dark:bg-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-medium text-card-foreground">
          {data.name}
        </CardTitle>
        <ProfileCardAction data={data} />
      </CardHeader>
      <CardContent className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Delivery" value={data.stats.delivery} color="chart-1" />
          <Stat label="Updates" value={data.stats.updates} color="chart-2" />
          <Stat label="Issues" value={data.stats.issues} color="chart-5" />
          <Stat label="WIP" value={data.stats.wip} color="chart-3" />
        </div>
      </CardContent>
    </Card>
  );
};

// 🎨 Light & Dark hex color maps
const colorMap: Record<
  string,
  {
    light: { bg: string; text: string; border: string };
    dark: { bg: string; text: string; border: string };
  }
> = {
  "chart-1": {
    light: { bg: "#E0F2FE", text: "#0284C7", border: "#BAE6FD" }, // blue
    dark: { bg: "#082F49", text: "#38BDF8", border: "#0C4A6E" },
  },
  "chart-2": {
    light: { bg: "#FEF9C3", text: "#CA8A04", border: "#FDE68A" }, // amber
    dark: { bg: "#422006", text: "#FACC15", border: "#713F12" },
  },
  "chart-3": {
    light: { bg: "#DCFCE7", text: "#16A34A", border: "#BBF7D0" }, // green
    dark: { bg: "#052E16", text: "#4ADE80", border: "#166534" },
  },
  "chart-5": {
    light: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" }, // red
    dark: { bg: "#450A0A", text: "#F87171", border: "#7F1D1D" },
  },
};

const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: keyof typeof colorMap;
}) => {
  const styles = colorMap[color];

  return (
    <div className="flex items-center justify-between text-[20px]">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge
        variant="secondary"
        className="border"
        style={{
          backgroundColor: styles.light.bg,
          color: styles.light.text,
          borderColor: styles.light.border,
        }}
      >
        {value}
      </Badge>

      {/* 👇 Overlay a dark-mode style */}
      <style jsx>{`
        :global(.dark) .${color}-badge {
          background-color: ${styles.dark.bg} !important;
          color: ${styles.dark.text} !important;
          border-color: ${styles.dark.border} !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileCard;
