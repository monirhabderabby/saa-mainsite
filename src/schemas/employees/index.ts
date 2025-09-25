import { z } from "zod";

export const employeeFilterSchema = z.object({
  serviceId: z.string().optional(),
  departmentId: z.string().optional(),
  accountStatus: z.string().optional(),
  teamId: z.string().optional(),
  searchQuery: z.string().optional(),
  role: z.string().optional(),
});

export type EmployeeFilterType = z.infer<typeof employeeFilterSchema>;
