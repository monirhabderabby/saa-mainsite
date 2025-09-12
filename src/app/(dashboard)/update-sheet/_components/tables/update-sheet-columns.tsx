import { UpdateSheetData } from "@/helper/update-sheet";
import { ColumnDef } from "@tanstack/react-table";

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
      return <div>{row.original.updateBy.fullName}</div>;
    },
  },
];
