import { Button } from "@/components/ui/button";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";

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
    header: "Action",
    cell: ({ row }) => (
      <>
        <Button size="icon" variant="ghost" asChild>
          <Link href={`/update-sheet/edit/${row.original.id}`}>
            <Pencil />
          </Link>
        </Button>
      </>
    ),
  },
];
