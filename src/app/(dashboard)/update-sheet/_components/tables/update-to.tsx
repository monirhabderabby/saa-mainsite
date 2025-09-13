import UpdateToBadge from "@/components/ui/update-to-badge";
import { UpdateSheetData } from "@/helper/update-sheet";

interface Props {
  data: UpdateSheetData;
}

const UpdateToComponents = ({ data }: Props) => {
  return <UpdateToBadge updateTo={data.updateTo} />;
};

export default UpdateToComponents;
