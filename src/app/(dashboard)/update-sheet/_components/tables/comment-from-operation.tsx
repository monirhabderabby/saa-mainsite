import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { useMemo, useRef } from "react";

interface Props {
  data: UpdateSheetData;
}

const COLORS = [
  { bg: "bg-red-100", hover: "hover:bg-red-200" },
  { bg: "bg-green-100", hover: "hover:bg-green-200" },
  { bg: "bg-blue-100", hover: "hover:bg-blue-200" },
  { bg: "bg-yellow-100", hover: "hover:bg-yellow-200" },
  { bg: "bg-purple-100", hover: "hover:bg-purple-200" },
  { bg: "bg-pink-100", hover: "hover:bg-pink-200" },
  { bg: "bg-orange-100", hover: "hover:bg-orange-200" },
];

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const CommentFormOperation = ({ data }: Props) => {
  // Keep track of previous color
  const lastColorRef = useRef<{ bg: string; hover: string } | null>(null);

  const color = useMemo(() => {
    let newColor;
    do {
      newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (newColor === lastColorRef.current);
    lastColorRef.current = newColor;
    return newColor;
  }, []);

  if (!data.commentFromOperation) return null;

  const content = isValidUrl(data.commentFromOperation) ? (
    <a
      href={data.commentFromOperation}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline truncate"
    >
      {data.commentFromOperation}
    </a>
  ) : (
    <p className="break-words">{data.commentFromOperation}</p>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" className={`${color.bg} ${color.hover}`}>
          {data.commentFromOperation.slice(0, 10) + " ..."}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex items-start gap-2">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

export default CommentFormOperation;
