import prisma from "@/lib/prisma";

const TotalDeliveryInQue = async () => {
  const counts = await prisma.updateSheet.count({
    where: {
      tlId: {
        not: null,
      },
      doneById: null,
      updateTo: "DELIVERY",
    },
  });
  return (
    <div className="flex justify-center items-center flex-col border border-input min-h-[100px] rounded-lg bg-primary-green/5">
      <h1 className="text-[25px]">{counts}</h1>
      <p className="text-primary-green">Delivery In Que</p>
    </div>
  );
};

export default TotalDeliveryInQue;
