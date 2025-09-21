import { z } from "zod";

export const databaseManagementFormSchema = z
  .object({
    collection: z.enum(["updateSheet", "issueSheet"], {
      message: "Select a collection first",
    }),
    startDate: z.date({
      message: "Start date is required",
    }),
    endDate: z.date({
      message: "End date is required",
    }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type DatabaseManagementFormSchemaType = z.infer<
  typeof databaseManagementFormSchema
>;
