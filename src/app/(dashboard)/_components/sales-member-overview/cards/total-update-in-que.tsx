import prisma from "@/lib/prisma";

const TotalUpdateInQue = async () => {
  const counts = await prisma.updateSheet.count({
    where: {
      tlId: {
        not: null,
      },
      doneById: null,
    },
  });
  return (
    <div className="flex justify-center items-center flex-col border border-input min-h-[100px] rounded-lg bg-blue-500/5">
      <h1 className="text-[25px]">{counts}</h1>
      <p className="text-blue-600">Update In Que</p>
    </div>
  );
};

export default TotalUpdateInQue;
