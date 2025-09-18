import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserWithAllIncludes } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import dynamic from "next/dynamic";
import AccountStatusAction from "./table-actions/account-status-action";
import EmployeeAction from "./table-actions/employee-action";
const RoleManagement = dynamic(
  () => import("./table-actions/role-management"),
  {
    ssr: false,
  }
);

export const employeeColumns: ColumnDef<UserWithAllIncludes>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "fullName",
    header: "Employee Name",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex items-center gap-2">
          <div>
            <Avatar className="h-[25px] w-[25px]">
              <AvatarImage src="/placeholder.avif" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1>{data.fullName}</h1>
            <p>{data.designation.name}</p>
          </div>
        </div>
      );
    },
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleManagement data={row.original} />,
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
