import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { BarChart3, Bug, FileText, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import AssignedTeamCard from "./_components/cards/assigned-team-card";
import ClientReviewCard from "./_components/cards/client-review-card";
import ProjectDocumentsCard, {
  DocumentItem,
} from "./_components/cards/project-document-card";
import SalesPersonCard from "./_components/cards/sales-person-card";
import ProjectDetailsHeader from "./_components/header/project-details-header";
import OverViewContainer from "./_components/overview/overview-container";

const Page = async ({ params }: { params: { projectId: string } }) => {
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
      profile: true, // include profile here to match type
    },
  });

  if (!project) notFound();

  const documents = [
    project.instructionSheet && {
      key: "instruction",
      label: "Instruction Sheet",
      icon: <FileText className="h-4 w-4 text-primary-yellow" />,
      url: project.instructionSheet,
    },
    project.progressSheet && {
      key: "progress",
      label: "Progress Sheet",
      icon: <BarChart3 className="h-4 w-4 text-primary-yellow" />,
      url: project.progressSheet,
    },
    project.credentialSheet && {
      key: "credential",
      label: "Credential Sheet",
      icon: <Shield className="h-4 w-4 text-primary-yellow" />,
      url: project.credentialSheet,
    },
    project.websiteIssueTrackerSheet && {
      key: "issue",
      label: "Issue Tracker",
      icon: <Bug className="h-4 w-4 text-primary-yellow" />,
      url: project.websiteIssueTrackerSheet,
    },
  ].filter(Boolean); // 🔥 removes undefined

  return (
    <section className="w-full flex gap-x-5">
      <Card className="flex-1 p-3  shadow-none space-y-5">
        <ProjectDetailsHeader data={project} />
        <OverViewContainer data={project} />
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
      </div>
    </section>
  );
};

export default Page;
