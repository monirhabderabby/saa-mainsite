import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Bug, ChartSpline, FileText, KeyRound } from "lucide-react";
import { notFound } from "next/navigation";
import AssignedTeamCard from "./_components/cards/assigned-team-card";
import ClientReviewCard from "./_components/cards/client-review-card";
import ProjectDocumentsCard, {
  DocumentItem,
} from "./_components/cards/project-document-card";
import QuickActionCard from "./_components/cards/quick-action";
import SalesPersonCard from "./_components/cards/sales-person-card";
import ProjectDetailsHeader from "./_components/header/project-details-header";
import OverViewContainer from "./_components/overview/overview-container";

const Page = async ({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { tab?: string };
}) => {
  const { projectId } = params;

  if (!projectId) notFound();

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      salesPerson: {
        select: {
          id: true,
          fullName: true,
          image: true,
          designation: {
            select: {
              name: true,
            },
          },
        },
      },
      team: true,
      projectAssignments: true,
      phase: true,
      profile: true,
    },
  });

  if (!project) notFound();

  const documents = [
    project.instructionSheet && {
      key: "instruction",
      label: "Instruction Sheet",
      icon: <FileText className="h-4 w-4 text-[#2563EB]" />,
      url: project.instructionSheet,
      iconBgColor: "",
    },
    project.progressSheet && {
      key: "progress",
      label: "Progress Sheet",
      icon: <ChartSpline className="h-4 w-4 text-[#16A34A]" />,
      url: project.progressSheet,
    },
    project.credentialSheet && {
      key: "credential",
      label: "Credential Sheet",
      icon: <KeyRound className="h-4 w-4 text-[#9333EA]" />,
      url: project.credentialSheet,
    },
    project.websiteIssueTrackerSheet && {
      key: "issue",
      label: "Issue Tracker",
      icon: <Bug className="h-4 w-4 text-[#DC2626]" />,
      url: project.websiteIssueTrackerSheet,
    },
  ].filter(Boolean);

  // Get the tab from searchParams, default to "overview"
  const currentTab = searchParams.tab || "overview";

  return (
    <section className="w-full flex gap-x-5">
      <Card className="flex-1 p-3 shadow-none space-y-5 dark:bg-white/5">
        <ProjectDetailsHeader data={project} />
        <OverViewContainer data={project} tab={currentTab} />
      </Card>

      <div className="w-[240px] space-y-3">
        <SalesPersonCard
          fullName={project.salesPerson.fullName}
          image={project.salesPerson.image}
          designation={project.salesPerson.designation.name}
        />

        <AssignedTeamCard teamName={project.team.name} />

        {project.review && <ClientReviewCard rating={project.review} />}
        <ProjectDocumentsCard documents={documents as DocumentItem[]} />
        <QuickActionCard projectId={project.id} />
      </div>
    </section>
  );
};

export default Page;
