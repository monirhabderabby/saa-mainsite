import { UpdateTo } from "@prisma/client";
import React from "react";

interface Props {
  updateTo: UpdateTo;
}

export const colorMap: Record<UpdateTo, string> = {
  [UpdateTo.ORDER_PAGE_UPDATE]: "bg-blue-100 text-blue-800",
  [UpdateTo.INBOX_PAGE_UPDATE]: "bg-yellow-100 text-yellow-800",
  [UpdateTo.DELIVERY]: "bg-green-100 text-green-800",
  [UpdateTo.INBOX_AND_ORDER_PAGE_UPDATE]: "bg-purple-100 text-purple-800",
  [UpdateTo.UPWORK_INBOX]: "bg-pink-100 text-pink-800",
  [UpdateTo.REVIEW_RESPONSE]: "bg-orange-100 text-orange-800",
  [UpdateTo.FIVERR_SUPPORT_REPLY]: "bg-red-100 text-red-800",
};

export const labelMap: Record<UpdateTo, string> = {
  [UpdateTo.ORDER_PAGE_UPDATE]: "Order Page Update",
  [UpdateTo.INBOX_PAGE_UPDATE]: "Inbox Page Update",
  [UpdateTo.DELIVERY]: "Delivery",
  [UpdateTo.INBOX_AND_ORDER_PAGE_UPDATE]: "Inbox & Order Page Update",
  [UpdateTo.UPWORK_INBOX]: "Upwork Inbox",
  [UpdateTo.REVIEW_RESPONSE]: "Review Response",
  [UpdateTo.FIVERR_SUPPORT_REPLY]: "Fiverr Support Reply",
};

const UpdateToBadge: React.FC<Props> = ({ updateTo }) => {
  const colorClass = colorMap[updateTo] || "bg-gray-100 text-gray-800";
  const label = labelMap[updateTo] || updateTo;

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium  ${colorClass}`}
    >
      {label}
    </span>
  );
};

export { UpdateTo };
export default UpdateToBadge;
