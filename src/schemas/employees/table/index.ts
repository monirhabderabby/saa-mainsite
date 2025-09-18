import { AccountStatus } from "@prisma/client";
import { z } from "zod";

export const userStatusSchema = z.object({
  id: z.string(), // matches Prisma @default(cuid())
  accountStatus: z.nativeEnum(AccountStatus),
});

export type UserStatusSchemaType = z.infer<typeof userStatusSchema>;
