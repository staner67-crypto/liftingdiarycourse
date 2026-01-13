"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const CreateWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().max(1000).optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(input);

  const workout = await createWorkout(validated);

  revalidatePath("/dashboard");

  return { workoutId: workout.id, date: validated.date };
}
