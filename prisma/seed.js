import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = ["FSD", "SMM", "Mobile App", "SEM", "DM", "CMS"];
  const profiles = [
    "linkbuilders_Fiverr",
    "PPC_Buddy_Fiverr",
    "webtechbd1_Fiverr",
    "pagetech0_Fiverr",
    "webdev_pro2_Fiverr",
  ];

  const fsdDesignations = [
    "Project Manager",
    "Team Leader",
    "Assistant Team Leader",
    "Sr. Sales Executive",
    "Sales Executive",
    "Trainee Sales Executive",
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
  ];

  // Create or update services in parallel
  const createdServices = await Promise.all(
    services.map((serviceName) =>
      prisma.services.upsert({
        where: { name: serviceName },
        update: {},
        create: { name: serviceName },
      })
    )
  );

  await Promise.all(
    profiles.map((profileName) => {
      prisma.profile.create({
        data: {
          name: profileName,
        },
      });
    })
  );

  // Find FSD service
  const fsdService = createdServices.find((s) => s.name === "FSD");

  if (fsdService) {
    // Create or update designations for FSD in parallel
    await Promise.all(
      fsdDesignations.map((desigName) =>
        prisma.designations.upsert({
          where: {
            serviceId_name: {
              serviceId: fsdService.id,
              name: desigName,
            },
          },
          update: {},
          create: {
            name: desigName,
            serviceId: fsdService.id,
          },
        })
      )
    );
  }

  console.log("✅ Services and designations seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
