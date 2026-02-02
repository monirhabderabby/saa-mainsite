// utils/statusStyles.ts
import { ProjectStatus } from "@prisma/client";
// or just return plain string

export function getStatusBadgeProps(status: ProjectStatus) {
  const base = "whitespace-nowrap font-medium transition-colors";

  switch (status) {
    case "NRA":
      return {
        variant: "outline" as const,
        className: `${base} border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100`,
      };

    case "WIP":
      return {
        variant: "secondary" as const,
        className: `${base} bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200`,
      };

    case "Delivered":
      return {
        variant: "secondary" as const,
        className: `${base} bg-green-100 text-green-800 border-green-200 hover:bg-green-200`,
      };

    case "Revision":
      return {
        variant: "secondary" as const,
        className: `${base} bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200`,
      };

    case "Cancelled":
      return {
        variant: "destructive" as const,
        className: `${base}`, // destructive usually already has red
      };

    default:
      return {
        variant: "secondary" as const,
        className: `${base} bg-gray-100 text-gray-800`,
      };
  }
}
