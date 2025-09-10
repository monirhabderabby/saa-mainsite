import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

export const employeeColumns: ColumnDef<User>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "fullName",
    header: "Employee Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Joining Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;

      return <p>{moment(date).format("DD MMM, YYYY")}</p>;
    },
  },
];
