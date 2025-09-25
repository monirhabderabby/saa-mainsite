"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@prisma/client";
import dynamic from "next/dynamic";
const ProfileCardAction = dynamic(() => import("./profile-card-action"), {
  ssr: false,
});

interface Props {
  data: Profile;
}
const ProfileCard = ({ data }: Props) => {
  return (
    <Card className="shadow-none dark:bg-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex-1">{data.name}</CardTitle>
          <ProfileCardAction data={data} />
        </div>
      </CardHeader>
    </Card>
  );
};

export default ProfileCard;
