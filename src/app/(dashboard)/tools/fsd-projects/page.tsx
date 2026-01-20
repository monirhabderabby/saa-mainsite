import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
const ProjectStatsCard = dynamic(
  () => import("./_components/project-stats-card"),
  {
    ssr: false,
  },
);
const AddProjectModal = dynamic(
  () => import("./_components/add-project-modal"),
  {
    ssr: false,
  },
);

const now = new Date();

// Current month
const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfCurrentMonth = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  0,
  23,
  59,
  59,
);

// Previous month
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfLastMonth = new Date(
  now.getFullYear(),
  now.getMonth(),
  0,
  23,
  59,
  59,
);

function calculateChange(current: number, previous: number) {
  // No data in both periods
  if (previous === 0 && current === 0) {
    return {
      change: "0%",
      type: "positive" as const,
    };
  }

  // Growth from zero
  if (previous === 0 && current > 0) {
    return {
      change: "+100%",
      type: "positive" as const,
    };
  }

  const diff = ((current - previous) / previous) * 100;
  const rounded = Math.round(diff);

  return {
    change: `${rounded > 0 ? "+" : ""}${rounded}%`,
    type: rounded >= 0 ? "positive" : "negative",
  };
}

const Page = async () => {
  const profiles = await prisma.profile.findMany();

  if (!profiles)
    throw new Error("Profiles not found. route: /tools/fsd-project");

  const users = await prisma.user.findMany({
    where: {
      role: "SALES_MEMBER",
    },
  });

  const teams = await prisma.team.findMany({
    where: {
      service: {
        name: "FSD",
      },
    },
  });

  // total projects
  const currentTotalProjects = await prisma.project.count({
    where: {
      orderDate: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
  });

  const lastMonthTotalProjects = await prisma.project.count({
    where: {
      orderDate: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  });

  // total active project
  const currentTotalActiveProjects = await prisma.project.count({
    where: {
      orderDate: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
      status: {
        in: ["NRA", "Revision", "WIP"],
      },
    },
  });

  const lastMonthTotalActiveProjects = await prisma.project.count({
    where: {
      orderDate: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
      status: {
        in: ["NRA", "Revision", "WIP"],
      },
    },
  });

  // total delivered project
  const currentMonthTotalDeliveredProjects = await prisma.project.count({
    where: {
      delivered: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
      status: {
        in: ["Delivered"],
      },
    },
  });

  const lastMonthTotalDeliveredProjects = await prisma.project.count({
    where: {
      delivered: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
      status: {
        in: ["Delivered"],
      },
    },
  });

  // total revenue
  const currentMonthRevenue = await prisma.project.aggregate({
    where: {
      delivered: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
      status: {
        in: ["Delivered"],
      },
    },
    _sum: {
      monetaryValue: true,
    },
  });

  const lastMonthRevenue = await prisma.project.aggregate({
    where: {
      delivered: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
      status: {
        in: ["Delivered"],
      },
    },
    _sum: {
      monetaryValue: true,
    },
  });

  const currentRevenue = currentMonthRevenue._sum.monetaryValue ?? 0;
  const lastRevenue = lastMonthRevenue._sum.monetaryValue ?? 0;

  const totalProjectChange = calculateChange(
    currentTotalProjects,
    lastMonthTotalProjects,
  );
  const totalActiveProjectChange = calculateChange(
    currentTotalActiveProjects,
    lastMonthTotalActiveProjects,
  );
  const totalDeliveredProjectChange = calculateChange(
    currentMonthTotalDeliveredProjects,
    lastMonthTotalDeliveredProjects,
  );

  const totalRevenueChange = calculateChange(currentRevenue, lastRevenue);

  return (
    <Card>
      <CardHeader className=" w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>FSD Projects</CardTitle>
            <CardDescription className="mt-2">
              Manage and track all your fsd projects
            </CardDescription>
          </div>

          <AddProjectModal
            profiles={profiles}
            users={users ?? []}
            teams={teams}
          />
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-5">
        <ProjectStatsCard
          title="Total Projects"
          value={currentTotalProjects}
          change={totalProjectChange.change}
          changeType={totalProjectChange.type as "positive" | "negative"}
          icon="folder"
        />
        <ProjectStatsCard
          title="Active Projects"
          value={currentTotalActiveProjects}
          change={totalActiveProjectChange.change}
          changeType={totalActiveProjectChange.type as "positive" | "negative"}
          icon="activity"
        />

        <ProjectStatsCard
          title="Completed"
          value={currentMonthTotalDeliveredProjects}
          change={totalDeliveredProjectChange.change}
          changeType={
            totalDeliveredProjectChange.type as "positive" | "negative"
          }
          icon="checkCircle"
        />

        <ProjectStatsCard
          title="Revenue"
          value={currentRevenue}
          change={totalRevenueChange.change}
          changeType={totalRevenueChange.type as "positive" | "negative"}
          icon="doller"
        />
      </div>

      <CardContent>Table</CardContent>
    </Card>
  );
};

export default Page;
