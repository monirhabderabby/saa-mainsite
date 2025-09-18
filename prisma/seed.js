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

  const hashedPassword = await bcrypt.hash("123456789", 12);
  const designation = await prisma.designations.findFirst({
    where: {
      serviceId: fsdService,
    },
  });

  const account = {
    fullName: "Monir Hossain Rabby",
    email: "monir.bdcalling@gmail.com",
    employeeId: 17114,
    serviceId: fsdService.id,
    password: hashedPassword,
    accountStatus: "ACTIVE",
    role: "SUPER_ADMIN", // or another default role as per your schema
    designationId: designation.id,
  };

  await prisma.user.create({
    data: account,
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
