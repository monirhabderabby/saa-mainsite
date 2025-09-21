const { PrismaClient, IssueStatus } = require("@prisma/client");

const prisma = new PrismaClient();

function getPreviousMonthDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const year = currentMonth === 0 ? currentYear - 1 : currentYear;

  const daysInMonth = new Date(year, prevMonth + 1, 0).getDate();

  return { year, month: prevMonth, daysInMonth };
}

function getRandomDateInPreviousMonth(year, month, daysInMonth) {
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  return new Date(year, month, day, hour, minute, second);
}

function getRandomStatus() {
  const statuses = Object.values(IssueStatus);
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log("🌱 Starting seed...");

  const users = await prisma.user.findMany({ take: 10 });
  const teams = await prisma.team.findMany({ take: 5 });
  const services = await prisma.services.findMany({ take: 8 });
  const profiles = await prisma.profile.findMany({ take: 12 });

  if (users.length === 0 || services.length === 0 || profiles.length === 0) {
    throw new Error(
      "Need at least one User, Service, and Profile to create IssueSheets"
    );
  }

  const { year, month, daysInMonth } = getPreviousMonthDates();
  const clientNames = [
    "Acme Corp",
    "XYZ Ltd",
    "Tech Solutions",
    "Global Enterprises",
    "Innovative Designs",
    "Digital Creations",
    "Web Masters",
    "App Developers",
  ];
  const orderIds = Array.from({ length: 50 }, (_, i) => `ORD-${1000 + i}`);
  const notes = [
    "Urgent attention required",
    "Follow up with client",
    "Check quality standards",
    "Review specifications",
    "Coordinate with team",
    "Client requested changes",
    "Technical issues found",
    "Design approval pending",
  ];

  const issueSheets = [];

  for (let i = 0; i < 100; i++) {
    const createdAt = getRandomDateInPreviousMonth(year, month, daysInMonth);
    const status = getRandomStatus();

    const issueSheet = {
      clientName: getRandomElement(clientNames),
      orderId: getRandomElement(orderIds),
      specialNotes: Math.random() > 0.7 ? getRandomElement(notes) : null,
      orderPageUrl:
        Math.random() > 0.8
          ? `https://orders.example.com/order-${Math.floor(Math.random() * 1000)}`
          : null,
      inboxPageUrl:
        Math.random() > 0.8
          ? `https://inbox.example.com/thread-${Math.floor(Math.random() * 500)}`
          : null,
      fileOrMeetingLink:
        Math.random() > 0.6
          ? `https://meet.example.com/room-${Math.floor(Math.random() * 200)}`
          : null,
      noteForSales: Math.random() > 0.5 ? getRandomElement(notes) : null,
      status,
      statusChangedAt:
        status !== "open"
          ? new Date(
              createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
            )
          : null,
      statusChangedById: status !== "open" ? getRandomElement(users)?.id : null,
      creatorId: getRandomElement(users).id,
      teamId: Math.random() > 0.3 ? getRandomElement(teams)?.id : null,
      serviceId: getRandomElement(services).id,
      profileId: getRandomElement(profiles).id,
      createdAt,
      updatedAt: createdAt,
    };

    issueSheets.push(issueSheet);
  }

  console.log(`📝 Creating ${issueSheets.length} IssueSheet records...`);

  for (const issueSheet of issueSheets) {
    await prisma.issueSheet.create({
      data: issueSheet,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
