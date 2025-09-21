import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "lucide-react";
import DatabaseManagementForm from "./_components/database-management-form";

const DatabaseManagement = () => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>Database Management</CardTitle>
        </div>
        <CardDescription>
          Clear MongoDB collections by date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DatabaseManagementForm />
      </CardContent>
    </Card>
  );
};

export default DatabaseManagement;
