import { Button } from "@/components/ui/button";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DoneByComponent from "./done-by-component";
import TlCheckComponent from "./tl-check-component";
import UpdateToComponents from "./update-to";
import UpdatedByComponents from "./updated-by-component";
const ViewUpdateSheetModal = dynamic(() => import("./view-modal"), {
  ssr: false,
});

const CenteredHeader = (title: string) => {
  const Comp = () => <div className="text-center">{title}</div>;
  Comp.displayName = `CenteredHeader(${title})`;
  return Comp;
};

export const updateSheetColumns: ColumnDef<UpdateSheetData>[] = [
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
    accessorKey: "attachments",
    header: CenteredHeader("Attachments"),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Button asChild variant="link" effect="shine">
          <a
            href={row.original.attachments as string}
            className="hover:text-blue-500 transition-colors duration-300 "
            target="_blank"
          >
            {row.original.attachments?.slice(0, 20)}...
          </a>
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "commentFromOperation",
    header: "Comment (Operation)",
  },
  {
    accessorKey: "commentFromSales",
    header: "Comment (Sales)",
  },
  {
    accessorKey: "tlId",
    header: "TL Check",
    cell: ({ row }) => <TlCheckComponent data={row.original} />,
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
    cell: ({ row }) => (
      <>
        {row.original.sendAt ? (
          <Button disabled variant="ghost" size="sm">
            Sent ✅
          </Button>
        ) : (
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/update-sheet/edit/${row.original.id}`}>
              <Pencil />
            </Link>
          </Button>
        )}
      </>
    ),
  },
];
