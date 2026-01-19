import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

const Page = () => {
  return (
    <Card>
      <CardHeader className=" w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>FSD Projects</CardTitle>
            <CardDescription className="mt-2">
              Manage and track all your fsd projects
            </CardDescription>
          </div>
          <Button
            variant="default"
            effect="expandIcon"
            icon={Plus}
            iconPlacement="right"
          >
            New Project
          </Button>
        </div>
      </CardHeader>

      <CardContent>Table</CardContent>
    </Card>
  );
};

export default Page;
