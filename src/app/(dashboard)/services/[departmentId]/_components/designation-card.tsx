import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

interface DesignationCardProps {
  designationName: string;
  totalMembers: number;
  serviceName?: string;
  className?: string;
}

export function DesignationCard({
  designationName,
  totalMembers,
  serviceName,
  className,
}: DesignationCardProps) {
  return (
    <Card
      className={`shadow-lg hover:shadow-xl  transition-shadow duration-300 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Users className="h-5 w-5 text-green-500 dark:text-customYellow-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              {designationName}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {serviceName
                ? `${serviceName} Department`
                : "Designation Overview"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold t text-customYellow-primary">
              {totalMembers}
            </span>
            <span className="text-sm text-muted-foreground">members</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Total number of members in this designation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
