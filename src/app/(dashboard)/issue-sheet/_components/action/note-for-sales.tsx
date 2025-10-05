import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";

interface Props {
  data: IssueSheetData;
}

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const NoteForSales = ({ data }: Props) => {
  if (!data.specialNotes) return null;

  const content = isValidUrl(data.specialNotes) ? (
    <a
      href={data.specialNotes}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline truncate"
    >
      {data.specialNotes}
    </a>
  ) : (
    <p className="break-words">{data.specialNotes}</p>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">{data.specialNotes.slice(0, 10) + "..."}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex items-start gap-2">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

export default NoteForSales;
