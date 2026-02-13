import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import SupportPeriodTableContainer from "./_components/support-period-table-container";

const Page = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="font-medium">Support Period</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your projects
            </p>
          </div>
          <div className="flex items-center gap-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tools/fsd-projects">
                <ArrowLeftIcon />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <SupportPeriodTableContainer />
      </CardContent>
    </Card>
  );
};

export default Page;
