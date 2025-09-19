import prisma from "@/lib/prisma";

interface Props {
  teamId: string;
}

const IssueDoneStats = async ({ teamId }: Props) => {
  // Get today's start and end
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const issueOpens = await prisma.issueSheet.count({
    where: {
      teamId,
      status: "done",
      statusChangedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  return (
    <div className="flex justify-center items-center flex-col border border-input min-h-[100px] rounded-lg bg-primary-green/5">
      <h1 className="text-[25px]">{issueOpens}</h1>
      <p className="text-primary-green">Resolved</p>
    </div>
  );
};

export default IssueDoneStats;
