import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, LifeBuoy, Smile } from "lucide-react";

const cards = [
  {
    icon: LifeBuoy,
    iconBg:
      "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    value: 320,
    label: "Support Tickets",
    info: <Badge variant="secondary">12 Open, 308 Closed</Badge>,
  },
  {
    icon: CheckCircle2,
    iconBg:
      "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    value: "98%",
    label: "Resolved",
    info: <Badge>+2.1% this month</Badge>,
  },
  {
    icon: Smile,
    iconBg:
      "border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
    value: "4.8",
    label: "Satisfaction Rate",
    info: <Badge variant="secondary">Avg. (out of 5)</Badge>,
  },
];

export default function IssueOverview() {
  return (
    <div className="grid grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col items-start gap-6 p-5">
            {/* Icon */}
            <div
              className={cn(
                `rounded-xl flex items-center justify-center size-12 border`,
                card.iconBg
              )}
            >
              <card.icon className="size-6" />
            </div>
            {/* Value & Label */}
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground leading-none">
                {card.value}
              </div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </div>
            {card.info}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
