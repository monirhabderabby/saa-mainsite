import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import FilterContainer from "./_components/filter-container";

const Page = async () => {
  return (
    <Card className="shadow-none ">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle>Entries</CardTitle>
            <CardDescription>
              All update entries in one place — apply filters to quickly find
              what you need.
            </CardDescription>
          </div>
          <div className="flex items-center gap-5">
            <FilterContainer />
            <Button effect="gooeyLeft" asChild>
              <Link href="/update-sheet/add-entry" className="w-full">
                Add Entry
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>fsdf</CardContent>
    </Card>
  );
};

export default Page;
