import { Button } from "@/components/ui/button";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import StatusChangeBy from "./action/status-change-by";
import TeamSelector from "./action/team-selector";
const IssueSheetStatusAction = dynamic(
  () => import("./action/issue-sheet-status-action"),
  {
    ssr: false,
  }
);

const CenteredHeader = (title: string) => {
  const Comp = () => <div className="text-center">{title}</div>;
  Comp.displayName = `CenteredHeader(${title})`;
  return Comp;
};

export const issueSheetColumns: ColumnDef<IssueSheetData>[] = [
  {
    accessorKey: "profile",
    header: "Profile",
    cell: ({ row }) => <p>{row.original.profile.name}</p>,
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
  },
  {
    accessorKey: "teamId",
    header: "Team",
    cell: ({ row }) => <TeamSelector data={row.original} />,
  },
  {
    accessorKey: "specialNotes",
  },
  {
    accessorKey: "orderPageUrl",
    cell: ({ row }) => (
      <>
        {row.original.orderPageUrl && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.orderPageUrl as string} target="_blank">
              check
            </a>
          </Button>
        )}
      </>
    ),
  },
  {
    accessorKey: "inboxPageUrl",
    cell: ({ row }) => (
      <>
        {row.original.inboxPageUrl && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.inboxPageUrl as string} target="_blank">
              check
            </a>
          </Button>
        )}
      </>
    ),
  },
  {
    accessorKey: "fileOrMeetingLink",
    header: "File/Meeting Link (If any)",
    cell: ({ row }) => (
      <>
        {row.original.fileOrMeetingLink && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.fileOrMeetingLink as string} target="_blank">
              check
            </a>
          </Button>
        )}
      </>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <IssueSheetStatusAction data={row.original} />,
  },
  {
    accessorKey: "statusChangedById",
    header: CenteredHeader("Change By"),
    cell: ({ row }) => <StatusChangeBy data={row.original} />,
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <>
        <Button size="icon" variant="ghost" asChild>
          <Link href={`/issue-sheet/edit/${row.original.id}`}>
            <Pencil />
          </Link>
        </Button>
      </>
    ),
  },
];
