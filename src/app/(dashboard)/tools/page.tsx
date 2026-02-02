import { Code } from "lucide-react";
import Tool from "./_components/tool";

const Page = () => {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <Tool
        name="FSD Projects"
        icon={Code}
        description="Streamline workflows, track milestones, and manage project requirements efficiently."
        href="/tools/fsd-projects"
        color="bg-blue-100"
      />
    </div>
  );
};

export default Page;
