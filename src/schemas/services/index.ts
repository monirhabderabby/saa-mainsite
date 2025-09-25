import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1),
  departmentId: z.string().min(1),
});

export type SerivceSchemaType = z.infer<typeof serviceSchema>;

export const addManagerSchema = z.object({
  serviceManagerId: z.string().min(1, "Manager ID is required"),
  serviceId: z.string().min(1, {
    message: "Service Id is Requires",
  }),
});

export type AddManagerSchemaType = z.infer<typeof addManagerSchema>;
