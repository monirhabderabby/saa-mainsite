import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface TeamCardProps {
  serviceName: string;
  teamName: string;
  members: { name: string; avatarUrl?: string }[];
}

const TeamCard: React.FC<TeamCardProps> = ({
  serviceName,
  teamName,
  members,
}) => {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{serviceName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-muted-foreground">
            {teamName}
          </h3>
        </div>
        <div className="flex justify-between items-end gap-5">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {members.map((member, idx) => (
              <Avatar key={idx} className="w-8 h-8">
                {member.avatarUrl ? (
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                ) : (
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {members.length} members
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
