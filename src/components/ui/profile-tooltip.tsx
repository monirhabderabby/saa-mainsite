import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import moment from "moment";
import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface Props {
  trigger: ReactNode;
  fullName: string;
  joiningDate?: Date | null;
  designation?: string;
  teamName?: string;
  profilePhoto?: string;
}

export default function ProfileToolTip({
  trigger,
  fullName,
  joiningDate,
  designation,
  teamName,
  profilePhoto,
}: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-fit">
        <div className="flex justify-between gap-4">
          {profilePhoto && (
            <Avatar>
              <AvatarImage src={profilePhoto} />
              <AvatarFallback>{fullName.slice(0)}</AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{fullName}</h4>
            <div className="text-sm">{designation}</div>
            {teamName && <p className="text-xs">Team: {teamName}</p>}

            <div className="text-muted-foreground text-xs">
              {moment(joiningDate).format("DD MMM, YYYY [at] h:mm A")}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
