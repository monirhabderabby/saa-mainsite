import prisma from "@/lib/prisma";

interface Props {
  teamId: string;
}

const IssueOpenStatus = async ({ teamId }: Props) => {
  const issueOpens = await prisma.issueSheet.count({
    where: {
      teamId,
      status: "open",
    },
  });
  return (
    <div className="flex justify-center items-center flex-col border border-input min-h-[100px] rounded-lg bg-red-500/5">
      <h1 className="text-[25px]">{issueOpens}</h1>
      <p className="text-red-600">Issue Open</p>
    </div>
  );
};

export default IssueOpenStatus;
