import AddUpdateForm from "@/components/forms/update-sheet/add-update-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

const Page = async () => {
  const profiles = await prisma.profile.findMany();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Entry</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <AddUpdateForm profiles={profiles} />
      </CardContent>
    </Card>
  );
};

export default Page;
