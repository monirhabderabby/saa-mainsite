import { Button } from "@/components/ui/button";
import { UpdateSheetData } from "@/helper/update-sheet";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UpdateToComponents from "./update-to";

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
    cell: ({}) => (
      <Button variant="outline" size="sm">
        View
      </Button>
    ),
  },
  {
    accessorKey: "attachments",
    header: "Attachments",
    cell: ({ row }) => (
      <a
        href={row.original.attachments as string}
        className="hover:text-blue-500 transition-colors duration-300"
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
    accessorKey: "updateTo",
    header: "Update To",
    cell: ({ row }) => <UpdateToComponents data={row.original} />,
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <Button size="icon" variant="ghost" asChild>
        <Link href={`/update-sheet/edit/${row.original.id}`}>
          <Pencil />
        </Link>
      </Button>
    ),
  },
];
