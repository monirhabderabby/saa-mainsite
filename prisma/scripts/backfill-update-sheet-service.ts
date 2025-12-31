import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillServiceIdFast() {
  console.log("Fetching users with serviceId...");

  // 1️⃣ Get users who have serviceId
  const users = await prisma.user.findMany({
    where: {
      serviceId: {
        not: null,
      },
    },
    select: {
      id: true,
      serviceId: true,
    },
  });

  console.log(`Found ${users.length} users with serviceId`);

  let totalUpdated = 0;

  // 2️⃣ For each user → updateMany
  for (const user of users) {
    const result = await prisma.updateSheet.updateMany({
      where: {
        updateById: user.id,
        OR: [{ serviceId: null }, { serviceId: { isSet: false } }],
      },
      data: {
        serviceId: user.serviceId!,
      },
    });

    totalUpdated += result.count;
  }

  console.log(`✅ Backfill completed. Updated ${totalUpdated} records.`);
}

backfillServiceIdFast()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());

// run: npx ts-node prisma/scripts/backfill-update-sheet-service.ts
