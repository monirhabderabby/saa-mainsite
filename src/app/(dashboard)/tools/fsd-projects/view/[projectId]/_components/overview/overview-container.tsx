import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";

import { ProjectNavigation } from "../project-navigation";
import OverviewTabContainer from "./overview-tab/overview-tab-container";

interface Props {
  data: SafeProjectDto;
  tab?: string;
}

const OverViewContainer = ({ data, tab = "overview" }: Props) => {
  const renderTabContent = () => {
    switch (tab) {
      case "overview":
        return <OverviewTabContainer data={data} />;
      case "team":
        return <div>Team content here</div>;
      case "phases":
        return <div>Phases content here</div>;
      case "documents":
        return <div>Documents content here</div>;
      case "timeline":
        return <div>Timeline content here</div>;
      default:
        return <OverviewTabContainer data={data} />;
    }
  };

  return <ProjectNavigation>{renderTabContent()}</ProjectNavigation>;
};

export default OverViewContainer;
