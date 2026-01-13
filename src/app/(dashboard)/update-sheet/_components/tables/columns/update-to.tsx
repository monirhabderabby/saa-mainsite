import UpdateToBadge from "@/components/ui/update-to-badge";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";

interface Props {
  data: UpdateSheetData;
}

const UpdateToComponents = ({ data }: Props) => {
  return (
    <div className="w-[110%] whitespace-nowrap">
      <UpdateToBadge updateTo={data.updateTo} />
    </div>
  );
};

export default UpdateToComponents;
