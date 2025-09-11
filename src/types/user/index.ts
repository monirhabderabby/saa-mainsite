import { Prisma } from "@prisma/client";

export type UserWithAllIncludes = Prisma.UserGetPayload<{
  include: { service: true; permissions: true };
}>;

export type PermissionField =
  | "isIssueCreateAllowed"
  | "isIssueUpdatAllowed"
  | "isMessageCreateAllowed"
  | "isMessageTLCheckAllowed"
  | "isMessageDoneByAllowed";
