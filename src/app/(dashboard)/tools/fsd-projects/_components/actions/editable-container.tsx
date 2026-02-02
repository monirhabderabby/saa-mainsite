import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import AddProjectModal from "../add-project-modal";

interface Props {
  project: SafeProjectDto;
  open: boolean;
  setOpen: (p: boolean) => void;
}

const EditableContainer = ({ project, open, setOpen }: Props) => {
  return (
    <div>
      <AddProjectModal open={open} setOpen={setOpen} initialData={project} />
    </div>
  );
};

export default EditableContainer;
