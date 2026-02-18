import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";

import ActivityTimeline from "../activity-timeline/activity-timeline";
import EnvVariables from "../environment_variables/env_variables";
import { ProjectNavigation } from "../project-navigation";
import QNAContainer from "../sections/q&a/_components/qna-container";
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
      case "qna":
        return <QNAContainer projectId={data.id} />;
      case "activity":
        return <ActivityTimeline projectId={data.id} />;
      case "env_variables":
        return <EnvVariables data={data} />;
      default:
        return <OverviewTabContainer data={data} />;
    }
  };

  return <ProjectNavigation>{renderTabContent()}</ProjectNavigation>;
};

export default OverViewContainer;
