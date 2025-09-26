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
    <Card className="bg-card border-border  transition-colors dark:bg-white/5">
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

const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center justify-between text-[20px]">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Badge
      variant="secondary"
      className={`bg-${color}/20 text-${color} border-${color}/30`}
    >
      {value}
    </Badge>
  </div>
);

export default ProfileCard;
