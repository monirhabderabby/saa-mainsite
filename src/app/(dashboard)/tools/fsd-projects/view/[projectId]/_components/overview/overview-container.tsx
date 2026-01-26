import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTabContainer from "./overview-tab/overview-tab-container";

interface Props {
  data: SafeProjectDto;
}

const OverViewContainer = ({ data }: Props) => {
  return (
    <div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTabContainer data={data} />
        </TabsContent>
        <TabsContent value="team">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default OverViewContainer;
