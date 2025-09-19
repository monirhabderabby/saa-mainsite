import prisma from "@/lib/prisma";

interface Props {
  teamId: string;
}

const WipStats = async ({ teamId }: Props) => {
  const issueOpens = await prisma.issueSheet.count({
    where: {
      teamId,
      status: "wip",
    },
  });
  return (
    <div className="flex justify-center items-center flex-col border border-input min-h-[100px] rounded-lg bg-primary-yellow/5">
      <h1 className="text-[25px]">{issueOpens}</h1>
      <p className="text-primary-yellow">Work In Progress</p>
    </div>
  );
};

export default WipStats;
