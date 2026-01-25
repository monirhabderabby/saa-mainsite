import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import MotionCard from "./motion-card";

interface AssignedTeamCardProps {
  teamName: string;
}

export default function AssignedTeamCard({ teamName }: AssignedTeamCardProps) {
  return (
    <MotionCard delay={0.1}>
      <Card className="shadow-none">
        <CardContent className="pt-3 px-3 space-y-2">
          <Label>Assigned Team</Label>
          <div className="bg-primary-yellow/20 text-sm font-medium p-3 rounded-lg">
            {teamName}
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
