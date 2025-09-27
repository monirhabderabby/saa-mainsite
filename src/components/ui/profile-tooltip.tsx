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
  designation?: string;
  teamName?: string;
}

export default function ProfileToolTip({
  trigger,
  fullName,
  joiningDate,
  designation,
  teamName,
}: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-fit">
        <div className="flex justify-between gap-4">
          {/* <Avatar>
            <AvatarImage src="/placeholder.avif" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar> */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{fullName}</h4>
            <div className="text-sm">
              {designation} {teamName && <span>at {teamName}</span>}
            </div>

            <div className="text-muted-foreground text-xs">
              {moment(joiningDate).format("DD MMM, YYYY [at] h:mm A")}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
