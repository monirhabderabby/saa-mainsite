import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";

const TotalProfile = async () => {
  const totalProfile = await prisma.profile.count();
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Total Profiles
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">
          {totalProfile}
        </div>
        <p className="text-xs text-muted-foreground">Active profiles</p>
      </CardContent>
    </Card>
  );
};

export default TotalProfile;
