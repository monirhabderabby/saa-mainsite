const AddProjectPhase = dynamic(
  () => import("@/components/shared/modal/add-project-phase"),
  {
    ssr: false,
  },
);
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Layers, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { PhaseCard } from "./phase-card";

interface Props {
  projectId: string;
}

const ProjectPhaseContainer = async ({ projectId }: Props) => {
  const projectPhases = await prisma.projectPhase.findMany({
    where: {
      projectId,
    },
  });

  return (
    <Card className="mx-auto shadow-none">
      {/* Card Container */}
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Project Phases
            </h2>
          </div>
          <AddProjectPhase
            projectId={projectId}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-sky-500 hover:text-sky-600 hover:bg-sky-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Phase
              </Button>
            }
          />
        </div>

        {/* Phase Cards */}
        {projectPhases.length > 0 && (
          <div className="flex flex-col gap-3">
            {projectPhases.map((phase, i) => (
              <PhaseCard
                key={phase.id}
                phaseNumber={i + 1}
                title={phase.title}
                deliverable={phase.willBeDeliver}
                points={phase.value}
                status={phase.status}
                instructionSheet={phase.instructionSheet!}
                orderId={phase.orderId!}
                projectId={projectId}
                data={phase}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPhaseContainer;
