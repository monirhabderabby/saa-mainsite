import { UserWithAllIncludes } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import AccountStatusAction from "./table-actions/account-status-action";
import EmployeeAction from "./table-actions/employee-action";

export const employeeColumns: ColumnDef<UserWithAllIncludes>[] = [
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
    accessorKey: "accountStatus",
    header: "Status",
    cell: ({ row }) => <AccountStatusAction data={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Joining Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;

      return <p>{moment(date).format("DD MMM, YYYY")}</p>;
    },
  },
  {
    header: "Action",
    cell: ({ row }) => <EmployeeAction data={row.original} />,
  },
];
