import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- 1. Seed Permissions ----------
  const permissions = [
    { key: "user:approve", resource: "user", action: "approve" },
    { key: "user:create", resource: "user", action: "create" },
    { key: "issue:create", resource: "issue", action: "create" },
    { key: "issue:status:update", resource: "issue", action: "status:update" },
    { key: "update:read", resource: "update", action: "read" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  // ---------- 2. Seed Departments ----------
  const deptNames = ["Operation", "Sales", "BPU"];
  const departments = [];

  for (const name of deptNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments.push(dept);
  }

  const opDept = departments.find((d) => d.name === "Operation");
  if (!opDept) throw new Error("Operation department not found.");

  // ---------- 3. Seed Service Categories ----------
  const serviceCategoriesData = [
    "Full Stack Development",
    "CMS",
    "SEO",
    "Mobile App Development",
  ].map((name) => ({ name, departmentId: opDept.id }));

  for (const sc of serviceCategoriesData) {
    await prisma.serviceCategory.upsert({
      where: {
        departmentId_name: { departmentId: sc.departmentId, name: sc.name },
      },
      update: {},
      create: sc,
    });
  }

  const fsCat = await prisma.serviceCategory.findUnique({
    where: {
      departmentId_name: {
        departmentId: opDept.id,
        name: "Full Stack Development",
      },
    },
  });
  if (!fsCat) throw new Error("Full Stack Development category not found.");

  // ---------- 4. Seed Teams ----------
  const teamsData = [
    { name: "Dev-X", departmentId: opDept.id, serviceCategoryId: fsCat.id },
    {
      name: "Elite Stack",
      departmentId: opDept.id,
      serviceCategoryId: fsCat.id,
    },
  ];

  for (const team of teamsData) {
    await prisma.team.upsert({
      where: {
        departmentId_name: { departmentId: team.departmentId, name: team.name },
      },
      update: {},
      create: team,
    });
  }

  // ---------- 5. Seed Users (GM & HR) ----------
  const usersData = [
    {
      email: "monir.bdcalling@gmail.com",
      firstName: "GM",
      lastName: "Admin",
      password: "123456789",
      status: "APPROVED",
      employeeId: "GM001",
      designation: "GM",
      role: Role.GM,
      permissions: [
        "user:approve",
        "user:create",
        "issue:create",
        "issue:status:update",
        "update:read",
      ],
    },
    {
      email: "hr@example.com",
      firstName: "HR",
      lastName: "Admin",
      password: "hrpassword123",
      status: "PENDING",
      employeeId: "HR001",
      designation: "HR",
      role: Role.HR,
      permissions: ["user:approve", "user:create"],
    },
  ];

  for (const u of usersData) {
    const hashedPw = await bcrypt.hash(u.password, 12);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        password: hashedPw,
        status: u.status as any,
        employeeId: u.employeeId,
        designation: u.designation,
      },
    });

    // ---------- 6. Assign Role ----------
    const userRoleId = `${user.id}_${u.role}`;
    await prisma.userRole.upsert({
      where: { id: userRoleId },
      update: {},
      create: {
        id: userRoleId,
        userId: user.id,
        departmentId: null, // optional, for global role
        teamId: null, // optional
        role: u.role, // required by UserRoleUncheckedCreateInput
      },
    });

    // ---------- 7. Assign Permissions via RolePermission ----------
    for (const permKey of u.permissions) {
      const perm = await prisma.permission.findUnique({
        where: { key: permKey },
      });
      if (!perm) throw new Error(`Permission "${permKey}" not found`);

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: u.role, permissionId: perm.id },
        },
        update: {},
        create: { roleId: u.role, permissionId: perm.id, role: u.role },
      });
    }
  }

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
