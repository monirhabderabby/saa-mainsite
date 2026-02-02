import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import MotionCard from "./motion-card";

interface SalesPersonCardProps {
  fullName: string;
  image?: string | null;
  designation: string;
}

export default function SalesPersonCard({
  fullName,
  image,
  designation,
}: SalesPersonCardProps) {
  return (
    <MotionCard delay={0.05}>
      <Card className="shadow-none">
        <CardContent className="pt-3 px-3 space-y-2">
          <Label>Sales Person</Label>

          <div className="flex items-center gap-3">
            <Image
              src={image || "/avatar-placeholder.png"}
              alt={fullName}
              height={40}
              width={40}
              className="rounded-full object-cover"
            />

            <div>
              <h3 className="text-sm font-medium leading-none">{fullName}</h3>
              <p className="text-xs text-muted-foreground">{designation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
