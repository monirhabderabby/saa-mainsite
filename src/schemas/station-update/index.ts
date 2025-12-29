import * as z from "zod";

export const stationForm = z.object({
  shift: z.string().min(1, "Shift is required"),
  title: z.string().min(1, "Title is required"),
  assignments: z.array(
    z.object({
      userId: z.string().min(1, "User is required"),
      profiles: z
        .array(z.string().min(1))
        .min(1, "At least one profile is required"),
    })
  ),
});

export type StationFormValues = z.infer<typeof stationForm>;
