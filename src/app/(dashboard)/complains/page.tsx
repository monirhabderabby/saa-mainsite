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
import { PlusCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const complaints = await prisma.complaint.findMany({
    where: {
      creatorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Complaints</h1>
          <p className="text-muted-foreground">
            Track the status and history of your formal submissions.
          </p>
        </div>
        <Button effect="gooeyLeft" asChild>
          <Link href="/complains/create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Complaint
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {complaints.length === 0 ? (
          <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mb-2">No complaints yet</CardTitle>
            <CardDescription className="max-w-xs mx-auto mb-6">
              If you have any concerns regarding office operations or sheets, feel free to submit a formal complaint.
            </CardDescription>
            <Button variant="outline" asChild>
              <Link href="/complains/create">Submit your first complaint</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border
                      ${complaint.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" : 
                        complaint.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : 
                        "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                    >
                      {complaint.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{complaint.subject}</CardTitle>
                  <CardDescription className="text-xs">
                    Source: {complaint.source.replace("_", " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {complaint.message}
                  </p>
                  <div className="pt-4 border-t flex justify-between items-center">
                     <span className="text-[10px] font-medium text-customYellow-primary bg-customYellow-primary/10 px-2 py-0.5 rounded border border-customYellow-primary/20 uppercase">
                        Pending Review
                     </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
