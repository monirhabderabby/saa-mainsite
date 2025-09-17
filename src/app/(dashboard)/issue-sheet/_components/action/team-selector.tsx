import { assignTeamIntoIssueSheet } from "@/actions/issue-sheet/update";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { Team } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
  data: IssueSheetData;
}

const TeamSelector = ({ data }: Props) => {
  const [pending, startTransition] = useTransition();
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["teams-by-serviceid", data.serviceId],
    queryFn: () =>
      fetch(`/api/services/teams/${data.serviceId}`).then((res) => res.json()),
  });

  const onChange = (teamId: string) => {
    startTransition(() => {
      assignTeamIntoIssueSheet(teamId, data.id).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        // handle success
        toast.success(res.message);
      });
    });
  };

  return (
    <SkeletonWrapper isLoading={isLoading}>
      <Select
        value={data.teamId ?? undefined}
        onValueChange={onChange}
        disabled={pending}
      >
        <SelectTrigger className="focus:ring-0 ">
          <SelectValue placeholder="Select Team" />
        </SelectTrigger>
        <SelectContent>
          {teams &&
            teams.map((item) => (
              <SelectItem value={item.id} key={item.id}>
                {item.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </SkeletonWrapper>
  );
};

export default TeamSelector;
