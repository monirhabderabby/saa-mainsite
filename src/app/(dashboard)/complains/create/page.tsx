import CreateComplaintForm from "@/components/forms/complaint/create-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className=" space-y-8 pb-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle>New Complaint</CardTitle>
              <CardDescription className="text-xs">
                Submit a formal complaint. Management will review all
                submissions within 72 hours.
              </CardDescription>
            </div>
            <Button
              variant="link"
              effect="hoverUnderline"
              asChild
              className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link href="/complains" className="flex items-center gap-2">
                <MoveLeft className="h-4 w-4" /> Back to Complains
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CreateComplaintForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
