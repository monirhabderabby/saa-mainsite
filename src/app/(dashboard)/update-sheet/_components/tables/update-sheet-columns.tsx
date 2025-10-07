import { Button } from "@/components/ui/button";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { Role } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import Link from "next/link";
import CommentFormOperation from "./columns/comment-from-operation";
import DoneByComponent from "./columns/done-by-component";
import TlCheckComponent from "./columns/tl-check-component";
import { CurrentUserTeam } from "./table-container";
const UpdateToComponents = dynamic(() => import("./columns/update-to"), {
  ssr: false,
});
const UpdatedByComponents = dynamic(
  () => import("./columns/updated-by-component"),
  {
    ssr: false,
  }
);

const ViewUpdateSheetModal = dynamic(() => import("./columns/view-modal"), {
  ssr: false,
});

const CenteredHeader = (title: string) => {
  const Comp = () => <div className="text-center">{title}</div>;
  Comp.displayName = `CenteredHeader(${title})`;
  return Comp;
};

interface Props {
  currentUserRole: Role;
  currentUserId: string;
  currentUserTeam?: CurrentUserTeam | null;
}
export const updateSheetColumns = ({
  currentUserId,
  currentUserRole,
  currentUserTeam,
}: Props): ColumnDef<UpdateSheetData>[] => [
  {
    header: "Date",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      // Format date and time using moment
      const formattedDate = moment(createdAt).format("DD MMM, YYYY"); // e.g., 22 Sep, 2025
      const formattedTime = moment(createdAt).format("hh:mm A"); // e.g., 11:48 AM

      return (
        <div>
          <h5>{formattedDate}</h5>
          <p>{formattedTime}</p>
        </div>
      );
    },
    size: 180,
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
  },
  {
    accessorKey: "updateBy",
    header: CenteredHeader("Update By"),
    cell: ({ row }) => <UpdatedByComponents data={row.original} />,
  },
  {
    accessorKey: "message",
    header: CenteredHeader("Message"),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ViewUpdateSheetModal
          trigger={
            <Button variant="outline" size="sm">
              View
            </Button>
          }
          data={row.original}
        />
      </div>
    ),
  },
  {
    accessorKey: "commentFromOperation",
    header: "Comment (Operation)",
    cell: ({ row }) => <CommentFormOperation data={row.original} />,
  },
  {
    accessorKey: "commentFromSales",
    header: "Comment (Sales)",
  },
  {
    accessorKey: "tlId",
    header: () => <p className="text-center">Tl Check</p>,
    cell: ({ row }) => (
      <TlCheckComponent
        data={row.original}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        currentUserTeam={currentUserTeam}
      />
    ),
  },
  {
    accessorKey: "updateTo",
    header: "Update To  ",
    cell: ({ row }) => <UpdateToComponents data={row.original} />,
  },
  {
    accessorKey: "doneBy",
    header: "Done By",
    cell: ({ row }) => <DoneByComponent data={row.original} />,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const tlChecked = row.original.tlId ?? undefined;
      const isTlChecked = !!tlChecked;

      return (
        <>
          {row.original.sendAt ? (
            <Button disabled variant="ghost" size="sm">
              Sent ✅
            </Button>
          ) : isTlChecked ? (
            <Button disabled size="icon" variant="ghost">
              <Pencil />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" asChild>
              <Link href={`/update-sheet/edit/${row.original.id}`}>
                <Pencil />
              </Link>
            </Button>
          )}
        </>
      );
    },
  },
];
