import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <main className="flex-1">
      <div className="flex bg-transparent border-none shadow-none justify-between items-center w-full">
        <div>
          <CardTitle>Entries</CardTitle>
          <CardDescription>
            All update entries in one place — apply filters to quickly find what
            you need.
          </CardDescription>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/station-update/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Update
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
