/**
 * Extended Seed Script
 * ---------------------
 * Seeds:
 * - Departments (Sales, Operation)
 * - Services (under Operation dept)
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
const DEPARTMENTS = [
  { name: "Sales", image: null },
  { name: "Operation", image: null },
  { name: "BPU", image: null },
];

const MANAGEMENT_DESIGNATIONS = [
  "GM, ScaleUp Ads Agency",
  "AGM, ScaleUp Ads Agency",
  "GM, Operation",
  "AGM, Operation",
];

const FSD_DESIGNATIONS = [
  "Project Manager",
  "Team Leader",
  "Assistant Team Leader",
  "Sr. Back-End Developer",
  "Sr. Front-End Developer",
  "Back-End Developer",
  "Front-End Developer",
  "Jr. Back-End Developer",
  "Jr. Front-End Developer",
];

const SERVICE_NAMES = [
  "Google Ads",
  "SMM",
  "SEO",
  "CMS",
  "FSD",
  "App",
  "Management",
];

const PROFILE_NAMES = [
  "linkbuilders_Fiverr",
  "ppc_buddy_Fiverr",
  "webtechbd1_Fiverr",
  "pagetech0_Fiverr",
  "webdev_pro2_Fiverr",
  "adwords_buddy_Fiverr",
  "adsfrenzy_Fiverr",
  "adsdot_Fiverr",
  "gads_dm_Fiverr",
  "ppc_magnet_Fiverr",
  "ad_analytic_Fiverr",
  "semexpert_Fiverr",
  "ads_strategix_Fiverr",
  "ppcpro_Fiverr",
  "ppcwave_Fiverr",
  "rankeyfiy_Fiverr",
  "rank_ranger_Fiverr",
  "seo_boostify_Fiverr",
  "growth_pro2_Fiverr",
  "rankstorm_Fiverr",
  "seo_spark1_Fiverr",
  "endof_backlinks_Fiverr",
  "seofx_Fiverr",
  "cube_tech_Fiverr",
  "growthorbit_Fiverr",
  "smmtech_Fiverr",
  "social_bee2_Fiverr",
  "scaleup_ads_Fiverr",
  "pmax_ads_Fiverr",
  "amzppc_ads_Fiverr",
  "smads_Fiverr",
  "ads_dot_Fiverr",
  "amazonads_Fiverr",
  "scaling_ads_Fiverr",
  "socialm_ads_Fiverr",
  "ads_social1_Fiverr",
  "ads_genius2_Fiverr",
  "customweb_pro_Fiverr",
  "custom_web2_Fiverr",
  "ralive_Fiverr",
  "web_coding1_Fiverr",
  "pro_custom1_Fiverr",
  "webverse_dev_Fiverr",
  "devtech_pro_Fiverr",
  "codeweaver1_Fiverr",
  "pagefusion_Fiverr",
  "landing_page_pr_Fiverr",
  "pagecraft_Fiverr",
  "wp_strategix_Fiverr",
  "wp_coders1_Fiverr",
  "sqpro24_Fiverr",
  "devsquares_Fiverr",
  "sqspace_pro_Fiverr",
  "ecom_store3_Fiverr",
  "storefusion_Fiverr",
  "fusionkart_Fiverr",
  "web_mania_Fiverr",
  "sitewix_pro_Fiverr",
  "ah_apptech_Fiverr",
  "ibrahim_365_Fiverr",
  "appify_coders_Fiverr",
  "appx_tech_Fiverr",
  "app_genius2_Fiverr",
  "designqube_Fiverr",
  "uxfusion_Fiverr",
  "techspark1_Fiverr",
  "pitchcraft_Fiverr",
  "socialcraft_Fiverr",
  "slidescape_Fiverr",
  "smmcanvas_Fiverr",
  "smmspark_Fiverr",
  "smmclick_Fiverr",
];

/** Seed account */
const SEED_ADMIN = {
  fullName: "Anisur Rahman Roni",
  nickName: "Rony",
  email: "arrony.dm@gmail.com",
  employeeId: "17001",
  rawPassword: "123456789",
  role: "SUPER_ADMIN",
  accountStatus: "ACTIVE",
  teamName: "GM",
  designationName: "GM, ScaleUp Ads Agency",
  managementServiceName: "Management",
};

/** Upsert helpers */
async function upsertDepartments(departments) {
  return Promise.all(
    departments.map(({ name, image }) =>
      prisma.department.upsert({
        where: { name },
        update: { image },
        create: { name, image },
      })
    )
  );
}

async function upsertServices(names, departmentId) {
  return Promise.all(
    names.map((name) =>
      prisma.services.upsert({
        where: { name_departmentId: { name, departmentId } },
        update: { departmentId }, // ensure linked to department
        create: { name, departmentId },
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
      emailVerified: new Date(),
      nickName: SEED_ADMIN.nickName,
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
        isIssueUpdatAllowed: true,
      },
      {
        name: "UPDATE_SHEET",
        userId,
        isMessageCreateAllowed: true,
        isMessageTLCheckAllowed: true,
        isMessageDoneByAllowed: true,
      },
    ],
  });
}

/** Main flow */
async function main() {
  // 1. Departments
  const departments = await upsertDepartments(DEPARTMENTS);
  const operationDept = departments.find((d) => d.name === "Operation");

  if (!operationDept) throw new Error("Operation department not found");

  // 2. Services under Operation department
  const services = await upsertServices(SERVICE_NAMES, operationDept.id);

  // 3. Profiles
  await upsertProfiles(PROFILE_NAMES);

  // 4. Designations
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

  // 5. SUPER_ADMIN user
  const user = await createSuperAdmin(
    managementService.id,
    SEED_ADMIN.designationName
  );

  // 6. Team with that user
  await createTeamWithUser(SEED_ADMIN.teamName, managementService.id, user.id);

  // 7. Permissions
  await seedPermissions(user.id);

  console.log("✅ Database seeded successfully with departments!");
}

async function migrate() {
  console.log("called");
  const result = await prisma.updateSheet.updateMany({
    where: {},
    data: {
      teamId: "68d546d5244216e75fe20df6",
      serviceId: "68d5314a907cefb68d8ce382",
    },
  });

  console.log(result);
}

/** Entrypoint */
migrate()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
