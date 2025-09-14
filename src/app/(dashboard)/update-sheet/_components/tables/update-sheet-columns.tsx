import { Button } from "@/components/ui/button";
import { UpdateSheetData } from "@/helper/update-sheet/update-sheet";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import TlCheckComponent from "./tl-check-component";
import UpdateToComponents from "./update-to";
const ViewUpdateSheetModal = dynamic(() => import("./view-modal"), {
  ssr: false,
});

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
    header: "Update By",
    cell: ({ row }) => {
      return (
        <div className="flex justify-start items-center gap-x-2">
          {" "}
          <Image
            src="/placeholder.avif"
            height={20}
            width={20}
            alt={row.original.updateBy.fullName as string}
          />
          {row.original.updateBy.fullName}
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <ViewUpdateSheetModal
        trigger={
          <Button variant="outline" size="sm">
            View
          </Button>
        }
        data={row.original}
      />
    ),
  },
  {
    accessorKey: "attachments",
    header: "Attachments",
    cell: ({ row }) => (
      <a
        href={row.original.attachments as string}
        className="hover:text-blue-500 transition-colors duration-300 "
        target="_blank"
      >
        {row.original.attachments}
      </a>
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
    header: "Update To",
    cell: ({ row }) => <UpdateToComponents data={row.original} />,
  },
  {
    accessorKey: "doneBy",
    header: "Done By",
    cell: ({ row }) => {
      return (
        <div className="flex justify-start items-center gap-x-2">
          {" "}
          <Image
            src="/placeholder.avif"
            height={20}
            width={20}
            alt={row.original.doneBy?.fullName as string}
          />
          {row.original.doneBy?.fullName}
        </div>
      );
    },
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
