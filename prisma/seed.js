import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const services = [
    "FSD",
    "SMM",
    "Mobile App",
    "SEM",
    "DM",
    "CMS",
    "Management",
  ];
  const profiles = [
    "linkbuilders_Fiverr",
    "PPC_Buddy_Fiverr",
    "webtechbd1_Fiverr",
    "pagetech0_Fiverr",
    "webdev_pro2_Fiverr",
  ];

  const managementDesignations = [
    "General Manager",
    "Assistant General Manager",
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
    profiles.map((profileName) =>
      prisma.profile.upsert({
        where: {
          name: profileName,
        },
        update: {},
        create: {
          name: profileName,
        },
      })
    )
  );

  // Find FSD service
  const fsdService = createdServices.find((s) => s.name === "FSD");
  const managementService = createdServices.find(
    (s) => s.name === "Management"
  );

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

  if (managementService) {
    await Promise.all(
      managementDesignations.map((desigName) =>
        prisma.designations.upsert({
          where: {
            serviceId_name: {
              serviceId: managementService.id,
              name: desigName,
            },
          },
          update: {},
          create: {
            name: desigName,
            serviceId: managementService.id,
          },
        })
      )
    );
  }

  const hashedPassword = await bcrypt.hash("123456789", 12);
  const designation = await prisma.designations.findFirst({
    where: {
      serviceId: managementService.id,
      name: "General Manager",
    },
  });

  const account = {
    fullName: "Rony Vai (GM)",
    email: "monir.bdcalling@gmail.com",
    employeeId: "17114",
    serviceId: managementService.id,
    password: hashedPassword,
    accountStatus: "ACTIVE",
    role: "SUPER_ADMIN", // or another default role as per your schema
    designationId: designation.id,
  };

  const user = await prisma.user.create({
    data: account,
  });

  await prisma.team.create({
    data: {
      name: "GM",
      serviceId: managementService.id,
      userTeams: {
        create: {
          userId: user.id,
        },
      },
    },
  });

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
