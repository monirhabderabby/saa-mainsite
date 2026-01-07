import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TaskManagementContainer = () => {
  return (
    <Tabs defaultValue="myTasks">
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex justify-between items-start w-full">
            <div>
              <CardTitle>Tasks Management</CardTitle>
              <CardDescription className="max-w-[600px] mt-2">
                Create, assign, and track tasks across service lines. View your
                assigned tasks or explore all tasks to ensure timely completion
                by every assignee.
              </CardDescription>
            </div>
            <div className="flex items-center gap-5">
              <TabsList>
                <TabsTrigger value="myTasks">My Tasks</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="myTasks">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="all">Change your password here.</TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default TaskManagementContainer;
