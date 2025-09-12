import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Filter } from "lucide-react";
import AddFilterUpdateSheetEntries from "./add-filter-update-sheet-entries";

const FilterContainer = async () => {
  const profiles = await prisma.profile.findMany();
  return (
    <div>
      <AddFilterUpdateSheetEntries
        profiles={profiles ?? []}
        trigger={
          <Button variant="outline">
            <Filter /> Filter
          </Button>
        }
      />
    </div>
  );
};

export default FilterContainer;
