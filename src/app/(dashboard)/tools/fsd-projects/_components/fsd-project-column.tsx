import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/lib/icons";
import { getStatusBadgeProps } from "@/lib/tools/project-status-style";
import { ProjectStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import FsdProjectAction from "./actions/fsd-project-action";

export const getFSDProjectsColumn = (): ColumnDef<SafeProjectDto>[] => [
  {
    header: "Profile",
    cell: ({ row }) => {
      const profile = row.original.profile.name;

      return <p>{profile}</p>;
    },
  },
  {
    accessorKey: "clientName",
  },
  {
    header: "Instruction (S)",
    cell: ({ row }) => {
      const sheetLink = row.original.instructionSheet;

      return (
        <a
          href={sheetLink}
          className="flex items-center gap-x-2 w-fit cursor-pointer"
          target="_blank"
        >
          <Image src={icons.Sheet} alt="spreadsheet" width={10} height={10} />
          <span>Sheet</span>
          <ExternalLink className="size-3" />
        </a>
      );
    },
  },
  {
    header: "Value (M)",
    cell: ({ row }) => {
      const monetaryValue = row.original.monetaryValue;

      return <Badge variant="secondary">${monetaryValue}</Badge>;
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const projectStatus = row.original.status as ProjectStatus;
      const { variant, className } = getStatusBadgeProps(projectStatus);

      return (
        <Badge variant={variant} className={className}>
          {projectStatus}
        </Badge>
      );
    },
  },
  {
    header: "Team",
    cell: ({ row }) => {
      const team = row.original.team.name;

      return <p>{team}</p>;
    },
  },
  {
    header: "Action",
    cell: ({ row }) => <FsdProjectAction project={row.original} />,
  },
];
