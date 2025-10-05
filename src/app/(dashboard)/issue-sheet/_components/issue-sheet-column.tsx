import { Button } from "@/components/ui/button";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { Role } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import IssueSheetServiceLine from "./action/issue-sheet-service-line";
import IssueSheetStatusAction from "./action/issue-sheet-status-action";
import NoteForSales from "./action/note-for-sales";
import SpecialNotes from "./action/special-notes";
import StatusChangeBy from "./action/status-change-by";
import TeamSelector from "./action/team-selector";

const CenteredHeader = (title: string) => {
  const Comp = () => <div className="text-center">{title}</div>;
  Comp.displayName = `CenteredHeader(${title})`;
  return Comp;
};

interface Props {
  currentUserRole: Role;
  canEdit: boolean;
}

/**
 * Returns columns for the Issue Sheet table.
 *
 * Dynamically adjusts based on:
 * - User Role (Admin / Leader / Co-Leader / Sales)
 * - User Permissions (canEdit / canAssignTeam)
 */
export const issueSheetColumns = ({
  currentUserRole,
  canEdit,
}: Props): ColumnDef<IssueSheetData>[] => {
  return [
    {
      header: "Date",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        const formattedDate = moment(createdAt).format("DD MMM, YYYY");
        const formattedTime = moment(createdAt).format("hh:mm A");
        return (
          <div>
            <h5>{formattedDate}</h5>
            <p>{formattedTime}</p>
          </div>
        );
      },
      size: 250,
    },
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
      size: 160,
    },
    {
      accessorKey: "serviceId",
      header: "Service",
      cell: ({ row }) => <IssueSheetServiceLine data={row.original} />,
    },
    {
      accessorKey: "teamId",
      header: "Team",
      cell: ({ row }) => <TeamSelector data={row.original} />,
    },
    {
      accessorKey: "specialNotes",
      header: "Special Notes",
      cell: ({ row }) => <SpecialNotes data={row.original} />,
    },
    {
      accessorKey: "orderPageUrl",
      header: "Order Page",
      cell: ({ row }) =>
        row.original.orderPageUrl && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.orderPageUrl} target="_blank">
              check
            </a>
          </Button>
        ),
    },
    {
      accessorKey: "inboxPageUrl",
      header: "Inbox Page",
      cell: ({ row }) =>
        row.original.inboxPageUrl && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.inboxPageUrl} target="_blank">
              check
            </a>
          </Button>
        ),
    },
    {
      accessorKey: "fileOrMeetingLink",
      header: "File/Meeting Link",
      cell: ({ row }) =>
        row.original.fileOrMeetingLink && (
          <Button
            asChild
            variant="link"
            className="cursor-pointer hover:text-blue-500"
          >
            <a href={row.original.fileOrMeetingLink} target="_blank">
              check
            </a>
          </Button>
        ),
    },
    {
      accessorKey: "noteForSales",
      header: "Note for Sales",
      cell: ({ row }) => <NoteForSales data={row.original} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <IssueSheetStatusAction data={row.original} />,
    },
    {
      accessorKey: "statusChangedById",
      header: CenteredHeader("Changed By"),
      cell: ({ row }) => <StatusChangeBy data={row.original} />,
    },
    {
      header: "Action",
      cell: ({ row }) => {
        // Conditions:
        // - Admin/Super Admin can always edit
        // - Non-admins can edit only if canEdit=true
        const editable =
          currentUserRole === "SUPER_ADMIN" ||
          currentUserRole === "ADMIN" ||
          canEdit;

        return (
          <>
            {editable ? (
              <Button size="icon" variant="ghost" asChild>
                <Link href={`/issue-sheet/edit/${row.original.id}`}>
                  <Pencil />
                </Link>
              </Button>
            ) : (
              <Button size="icon" variant="ghost" disabled>
                <Pencil />
              </Button>
            )}
          </>
        );
      },
    },
  ];
};
