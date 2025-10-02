import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersData } from "@/helper/users";
import { Role } from "@prisma/client";
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

interface Props {
  currentUserRole: Role;
}

export const getEmployeeColumns = ({
  currentUserRole,
}: Props): ColumnDef<UsersData>[] => [
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
            <Avatar className="h-[30px] w-[30px]">
              <AvatarImage src={data.image ?? "/placeholder.avif"} />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1>{data.fullName}</h1>
            <p className="text-[12px]">{data.designation.name}</p>
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
    accessorKey: "departmentId",
    header: "Department",
    cell: ({ row }) => <p>{row.original.department?.name}</p>,
  },
  {
    accessorKey: "serviceId",
    header: "Service",
    cell: ({ row }) => <p>{row.original.service?.name}</p>,
  },
  {
    accessorKey: "userTeams",
    header: "Team",
    cell: ({ row }) => {
      const userTeams = row.original.userTeams;
      const team = userTeams.length > 0 ? userTeams[0] : undefined;
      const teamName = team?.team.name;

      return <p>{team ? teamName : "N/A"}</p>;
    },
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
    cell: ({ row }) => (
      <EmployeeAction data={row.original} currentUserRole={currentUserRole} />
    ),
  },
];
