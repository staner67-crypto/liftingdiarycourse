"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const UpdateWorkoutSchema = z.object({
  workoutId: z.number(),
  name: z.string().max(255).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().max(1000).optional().nullable(),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const validated = UpdateWorkoutSchema.parse(input);

  const workout = await updateWorkout(validated.workoutId, {
    name: validated.name,
    date: validated.date,
    notes: validated.notes,
  });

  revalidatePath("/dashboard");

  return { workoutId: workout.id, date: validated.date };
}
