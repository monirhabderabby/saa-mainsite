import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Filter, HandHeartIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import TodayNeedToUpdate from "./_components/features/today-need-to-update";
import UpcomingDeadlines from "./_components/features/upcoming-deadlines";
const BackToPrevPage = dynamic(() => import("./_components/BackToPrevPage"), {
  ssr: false,
});

const AddFilterFsdProject = dynamic(
  () => import("./_components/filter/add-filter-fsd-project"),
  {
    ssr: false,
  },
);
const FsdProjectTableContainer = dynamic(
  () => import("./_components/fsd-project-table-container"),
  {
    ssr: false,
  },
);
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
  const session = await auth();

  if (!session || !session.user || !session.user.id) redirect("/login");
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

  const profiles = await prisma.profile.findMany();
  const teams = await prisma.team.findMany({
    where: {
      service: {
        name: "FSD",
      },
    },
  });

  return (
    <div className="space-y-5">
      <Card className="shadow-none">
        <CardHeader className=" w-full">
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-x-3">
                <BackToPrevPage />
                <div>
                  <CardTitle>FSD Projects</CardTitle>
                  <CardDescription className="mt-2">
                    Manage and track all your fsd projects
                  </CardDescription>
                </div>
              </div>
            </div>

            <div>
              <AddProjectModal />
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-5 pb-5">
          <ProjectStatsCard
            title="Total Projects"
            value={currentTotalProjects.toString()}
            change={totalProjectChange.change}
            changeType={totalProjectChange.type as "positive" | "negative"}
            icon="folder"
          />
          <ProjectStatsCard
            title="Active Projects"
            value={currentTotalActiveProjects.toString()}
            change={totalActiveProjectChange.change}
            changeType={
              totalActiveProjectChange.type as "positive" | "negative"
            }
            icon="activity"
          />

          <ProjectStatsCard
            title="Completed"
            value={currentMonthTotalDeliveredProjects.toString()}
            change={totalDeliveredProjectChange.change}
            changeType={
              totalDeliveredProjectChange.type as "positive" | "negative"
            }
            icon="checkCircle"
          />

          <ProjectStatsCard
            title="Revenue"
            value={`$${currentRevenue}`}
            change={totalRevenueChange.change}
            changeType={totalRevenueChange.type as "positive" | "negative"}
            icon="doller"
          />
        </div>

        <div className="grid grid-cols-12 gap-5 px-5 pb-5">
          <div className="col-span-7 ">
            <UpcomingDeadlines loggedinUserId={session.user.id} />
          </div>
          <div className="col-span-5">
            <TodayNeedToUpdate loggedinUserId={session.user.id} />
          </div>
        </div>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <div className="  flex justify-between">
            <div>
              <h1 className="font-medium">All Projects</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your projects
              </p>
            </div>
            <div className="flex items-center gap-x-3">
              <Button variant="outline" size="sm">
                <HandHeartIcon />
                Support Period
              </Button>
              <AddFilterFsdProject
                trigger={
                  <Button variant="outline" size="sm">
                    <Filter /> Filter
                  </Button>
                }
                profiles={profiles}
                teams={teams}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FsdProjectTableContainer />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
