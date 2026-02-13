import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import FsdProjectActions from "../../_components/actions/fsd-project-action";

const getSupportStatus = (
  start?: Date | string | null,
  end?: Date | string | null,
) => {
  if (!start || !end) return null;

  const now = moment();
  const s = moment(start);
  const e = moment(end);

  if (now.isBetween(s, e, undefined, "[]")) return "Active" as const;
  if (now.isAfter(e)) return "Expired" as const;
  return "Upcoming" as const;
};

export const getSupportPeriodColumn = (): ColumnDef<SafeProjectDto>[] => [
  {
    header: "Profile",
    cell: ({ row }) => {
      const profile = row.original.profile?.name ?? "—";
      return (
        <span className="text-xs font-medium text-foreground">{profile}</span>
      );
    },
  },

  {
    header: "Client",
    accessorKey: "clientName",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.clientName ?? "—"}</span>
    ),
  },

  {
    header: "Value",
    cell: ({ row }) => {
      const value = row.original.monetaryValue;
      return (
        <span className="text-xs font-medium text-foreground">
          {value ? `$${value}M` : "—"}
        </span>
      );
    },
  },

  {
    header: "Status",
    cell: ({ row }) => {
      const status = getSupportStatus(
        row.original.supportPeriodStart,
        row.original.supportPeriodEnd,
      );

      if (!status) {
        return <span className="text-xs text-muted-foreground">Not set</span>;
      }

      const styles: Record<typeof status, string> = {
        Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        Expired: "bg-rose-50 text-rose-700 ring-rose-100",
        Upcoming: "bg-amber-50 text-amber-800 ring-amber-100",
      };

      return (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${styles[status]}`}
        >
          {status}
        </span>
      );
    },
  },

  {
    header: "Period Start",
    cell: ({ row }) => {
      const start = row.original.supportPeriodStart;

      if (!start) {
        return <span className="text-xs ">Not set</span>;
      }

      const s = moment(start);

      // SaaS style: one clean line
      return <span className="text-xs ">{s.format("DD MMM YYYY")}</span>;
    },
  },
  {
    header: "Period End",
    cell: ({ row }) => {
      const end = row.original.supportPeriodEnd;

      if (!end) {
        return <span className="text-xs ">Not set</span>;
      }

      const e = moment(end);

      // SaaS style: one clean line
      return <span className="text-xs ">{e.format("DD MMM YYYY")}</span>;
    },
  },

  {
    header: "Team",
    cell: ({ row }) => {
      const team = row.original.team?.name ?? "—";
      return <span className="text-xs ">{team}</span>;
    },
  },

  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <FsdProjectActions project={row.original} />
      </div>
    ),
  },
];
