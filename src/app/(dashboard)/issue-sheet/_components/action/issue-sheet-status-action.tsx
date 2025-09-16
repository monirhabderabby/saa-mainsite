import { changeIssueStatusAction } from "@/actions/issue-sheet/status-change";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { cn } from "@/lib/utils"; // You might need to install or create this
import { IssueStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: IssueSheetData;
}

// Helper function to get status color classes
const getStatusColor = (status: IssueStatus) => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800 border-red-200";
    case "wip":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "dispute":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper function to format status text for display
const formatStatusText = (status: IssueStatus) => {
  switch (status) {
    case "wip":
      return "Work In Progress";
    case "open":
    case "done":
    case "cancelled":
    case "dispute":
      return status.charAt(0) + status.slice(1).toLowerCase();
    default:
      return status;
  }
};

const IssueSheetStatusAction = ({ data }: Props) => {
  const [val, setVal] = useState<IssueStatus>(data.status);
  const [pending, startTransition] = useTransition();

  const onStatusChange = (value: IssueStatus) => {
    setVal(value);
    startTransition(() => {
      changeIssueStatusAction(data.id, value).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          setVal(data.status);
          return;
        }

        // handle success
        toast.success(res.message);
      });
    });
  };

  return (
    <Select value={val} onValueChange={onStatusChange} disabled={pending}>
      <SelectTrigger
        className={cn(
          " w-fit min-w-[120px] shadow-none border outline-none focus:ring-0 transition-colors font-medium",
          getStatusColor(val),
          pending && "opacity-70"
        )}
      >
        <SelectValue>
          <div className="flex items-center">{val}</div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.values(IssueStatus).map((status) => (
          <SelectItem key={status} value={status}>
            {formatStatusText(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IssueSheetStatusAction;
