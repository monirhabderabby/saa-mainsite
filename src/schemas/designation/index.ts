import { z } from "zod";

export const designationSchema = z.object({
  name: z.string({
    message: "Designation name is required",
  }),
  serviceId: z.string({
    message: "Service Id is required",
  }),
});

export type DesignationSchemaType = z.infer<typeof designationSchema>;
