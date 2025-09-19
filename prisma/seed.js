/**
 * Seed Script
 * -----------
 * Seeds:
 * - Services
 * - Profiles
 * - Designations (FSD + Management)
 * - A SUPER_ADMIN user with GM designation
 * - A "GM" team with that user as a member
 * - Two permission records for that user
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Constants */
const SERVICE_NAMES = [
  "FSD",
  "SMM",
  "Mobile App",
  "SEM",
  "DM",
  "CMS",
  "Management",
];

const PROFILE_NAMES = [
  "linkbuilders_Fiverr",
  "PPC_Buddy_Fiverr",
  "webtechbd1_Fiverr",
  "pagetech0_Fiverr",
  "webdev_pro2_Fiverr",
];

const MANAGEMENT_DESIGNATIONS = [
  "GM, ScaleUp Ads Agency",
  "AGM, ScaleUp Ads Agency",
  "GM, Operation",
  "AGM, Operation",
  "GM, Sales",
  "AGM, Sales",
];

const FSD_DESIGNATIONS = [
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

/** Seed account */
const SEED_ADMIN = {
  fullName: "Rony Vai (GM)",
  email: "monir.bdcalling@gmail.com",
  employeeId: "17114",
  rawPassword: "123456789",
  role: "SUPER_ADMIN",
  accountStatus: "ACTIVE",
  teamName: "GM",
  designationName: "GM, ScaleUp Ads Agency",
  managementServiceName: "Management",
};

/** Upsert helpers */
async function upsertServices(names) {
  return Promise.all(
    names.map((name) =>
      prisma.services.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
}

async function upsertProfiles(names) {
  return Promise.all(
    names.map((name) =>
      prisma.profile.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
}

async function upsertDesignationsForService(serviceId, designationNames) {
  return Promise.all(
    designationNames.map((name) =>
      prisma.designations.upsert({
        where: { serviceId_name: { serviceId, name } },
        update: {},
        create: { name, serviceId },
      })
    )
  );
}

/** Seed SUPER_ADMIN user */
async function createSuperAdmin(managementServiceId, designationName) {
  const designation = await prisma.designations.findFirst({
    where: { serviceId: managementServiceId, name: designationName },
  });

  if (!designation) {
    throw new Error(
      `Designation "${designationName}" not found under serviceId=${managementServiceId}`
    );
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN.rawPassword, 12);

  const user = await prisma.user.create({
    data: {
      fullName: SEED_ADMIN.fullName,
      email: SEED_ADMIN.email,
      employeeId: SEED_ADMIN.employeeId,
      serviceId: managementServiceId,
      password: passwordHash,
      accountStatus: SEED_ADMIN.accountStatus,
      role: SEED_ADMIN.role,
      designationId: designation.id,
    },
  });

  return user;
}

/** Create team and attach user */
async function createTeamWithUser(teamName, serviceId, userId) {
  return prisma.team.create({
    data: {
      name: teamName,
      serviceId,
      userTeams: {
        create: { userId },
      },
    },
  });
}

/** Seed permissions */
async function seedPermissions(userId) {
  await prisma.permissions.createMany({
    data: [
      {
        name: "ISSUE_SHEET",
        userId,
        isIssueCreateAllowed: true,
        isIssueUpdatAllowed: true, // Keep your schema spelling
      },
      {
        name: "UPDATE_SHEET",
        userId,
        isMessageCreateAllowed: true,
        isMessageTLCheckAllowed: true,
        isMessageDoneByAllowed: true,
      },
    ],
    // skipDuplicates: true // enable if schema allows
  });
}

/** Main flow */
async function main() {
  const services = await upsertServices(SERVICE_NAMES);
  await upsertProfiles(PROFILE_NAMES);

  const fsdService = services.find((s) => s.name === "FSD");
  const managementService = services.find(
    (s) => s.name === SEED_ADMIN.managementServiceName
  );

  if (!fsdService) throw new Error("Service 'FSD' not found");
  if (!managementService)
    throw new Error(`Service '${SEED_ADMIN.managementServiceName}' not found`);

  await upsertDesignationsForService(fsdService.id, FSD_DESIGNATIONS);
  await upsertDesignationsForService(
    managementService.id,
    MANAGEMENT_DESIGNATIONS
  );

  const user = await createSuperAdmin(
    managementService.id,
    SEED_ADMIN.designationName
  );

  await createTeamWithUser(SEED_ADMIN.teamName, managementService.id, user.id);
  await seedPermissions(user.id);

  console.log("✅ Database seeded successfully!");
}

/** Entrypoint */
main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
