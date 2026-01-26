import { z } from "zod";

export const addProjectPhaseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),

  title: z.string().min(1, "Title is required"),
  willBeDeliver: z.string().min(1, "Delivery info is required"),

  orderId: z.string().optional(),

  value: z.number().min(0, "Value must be positive"),
  monetaryValue: z.number().min(0, "Monetary value must be positive"),

  instructionSheet: z.string().min(1, "Instruction sheet is required"),

  status: z.string().min(1, "Status is required"),
});

export type AddProjectPhaseSchema = z.infer<typeof addProjectPhaseSchema>;
