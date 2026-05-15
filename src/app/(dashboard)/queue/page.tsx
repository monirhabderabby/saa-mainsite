// app/dashboard/queue/page.tsx
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { isQueueAccess } from "@/helper/permissions/queue-page-permission";
import prisma from "@/lib/prisma";
import { Services } from "@prisma/client";
import { redirect } from "next/navigation";
import { QueuePageClient } from "./_components/queue-page-client";

export const metadata = {
  title: "Queue",
};

export default async function QueuePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, managedServices: true, departmentId: true },
  });

  const profiles = await prisma.profile.findMany();

  if (!user) {
    redirect("/login");
  }

  const stationAssignment = await prisma.stationAssignmentProfile.findMany({
    where: {
      assignment: {
        userId: user.id,
      },
    },
  });

  const selectedProfilesShouldBe = stationAssignment.map((i) => i.profileId);

  const isServiceManager = user.managedServices.length > 0;

  const isAccess = await isQueueAccess({
    cuRole: user.role,
    cuId: user.id,
    isServiceManager: isServiceManager,
  });

  if (!isAccess) {
    redirect("/");
  }

  // ✅ Fetch services — scoped to the user's department if they have one,
  //    otherwise fetch all (admins / super admins).
  const services: Services[] = await prisma.services.findMany({
    where: user.departmentId ? { departmentId: user.departmentId } : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <Card className="p-5">
      <QueuePageClient
        userRole={user.role}
        currentUserId={user.id}
        profiles={profiles}
        defaultSelectedProfiles={selectedProfilesShouldBe}
        isAccess={isAccess}
        services={services}
      />
    </Card>
  );
}
