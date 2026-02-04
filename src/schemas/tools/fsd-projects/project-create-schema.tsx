import * as z from "zod";

export const projectCreateSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),

  orderId: z.string().min(1, "Order ID is required"),

  profileId: z.string().min(1, "Profile ID is required"),
  salesPersonId: z.string().min(1, "Sales Person ID is required"),

  instructionSheet: z.string().min(1, "Instruction sheet link is required"),

  orderDate: z.date(),
  deadline: z.date(),

  value: z.number().min(1, "Value must be a positive number"),
  monetaryValue: z
    .number()
    .int()
    .positive("Monetary Value must be a positive number"),

  shift: z.string().min(1, "Shift is required"),

  teamId: z.string().min(1, "Team ID is required"),

  // Optional fields at creation
  delivered: z.date().optional(),
  probablyWillBeDeliver: z.date().optional(),
  lastUpdate: z.date().optional(),
  nextUpdate: z.date().optional(),
  supportPeriodStart: z.date().optional(),
  supportPeriodEnd: z.date().optional(),

  remarkFromOperation: z.string().optional(),
  quickNoteFromLeader: z.string().optional(),

  review: z.number().int().min(1).max(5).optional(),

  // You don't need to send status because Prisma has a default (NRA)
  status: z.string().optional(),

  progressSheet: z.string().url().optional(),
  credentialSheet: z.string().url().optional(),
  websiteIssueTrackerSheet: z.string().url().optional(),

  // Optional assignment of a user at creation
  userId: z.string().optional(),
  uiuxAssigned: z.array(z.string()).optional(),
  backendAssigned: z.array(z.string()).optional(),
  frontendAssigned: z.array(z.string()).optional(),
});

export type ProjectCreateSchemaType = z.infer<typeof projectCreateSchema>;
