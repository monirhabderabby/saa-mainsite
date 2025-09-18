"use client";

import { AccountStatus } from "@prisma/client";
import { cva } from "class-variance-authority";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Props {
  status: AccountStatus;
  className?: string;
}

const statusVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300",
  {
    variants: {
      variant: {
        ACTIVE: "bg-green-100 text-green-800",
        DEACTIVE: "bg-red-100 text-red-800",
        PENDING: "bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "PENDING",
    },
  }
);

export const AccountStatusBadge = ({ status, className }: Props) => {
  let icon;
  switch (status) {
    case AccountStatus.ACTIVE:
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    case AccountStatus.DEACTIVE:
      icon = <XCircle className="w-4 h-4" />;
      break;
    case AccountStatus.PENDING:
      icon = <Clock className="w-4 h-4" />;
      break;
  }

  return (
    <span className={statusVariants({ variant: status, className })}>
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};
