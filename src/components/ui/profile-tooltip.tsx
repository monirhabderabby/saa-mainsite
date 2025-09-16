import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import moment from "moment";
import { ReactNode } from "react";

interface Props {
  trigger: ReactNode;
  fullName: string;
  joiningDate?: Date | null;
}

export default function ProfileToolTip({
  trigger,
  fullName,
  joiningDate,
}: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-fit">
        <div className="flex justify-between gap-4">
          <Avatar>
            <AvatarImage src="/placeholder.avif" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{fullName}</h4>
            <p className="text-sm">Full Stack Developer</p>
            <div className="text-muted-foreground text-xs">
              Joined {moment(joiningDate).format("DD MMM, YYYY")}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
