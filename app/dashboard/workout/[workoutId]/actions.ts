"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  createSet,
  updateSet,
  deleteSet,
} from "@/data/exercises";
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

// Add exercise to workout
const AddExerciseSchema = z.object({
  workoutId: z.number(),
  exerciseId: z.number(),
  order: z.number().default(0),
});

type AddExerciseInput = z.infer<typeof AddExerciseSchema>;

export async function addExerciseAction(input: AddExerciseInput) {
  const validated = AddExerciseSchema.parse(input);

  const workoutExercise = await addExerciseToWorkout(validated);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);

  return { workoutExerciseId: workoutExercise.id };
}

// Remove exercise from workout
const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.number(),
  workoutId: z.number(),
});

type RemoveExerciseInput = z.infer<typeof RemoveExerciseSchema>;

export async function removeExerciseAction(input: RemoveExerciseInput) {
  const validated = RemoveExerciseSchema.parse(input);

  await removeExerciseFromWorkout(validated.workoutExerciseId);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);

  return { success: true };
}

// Create set
const CreateSetSchema = z.object({
  workoutExerciseId: z.number(),
  setNumber: z.number().int().positive(),
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Weight must be a valid decimal number")
    .nullable(),
  reps: z.number().int().min(0).nullable(),
  workoutId: z.number(),
});

type CreateSetInput = z.infer<typeof CreateSetSchema>;

export async function createSetAction(input: CreateSetInput) {
  const validated = CreateSetSchema.parse(input);

  const set = await createSet({
    workoutExerciseId: validated.workoutExerciseId,
    setNumber: validated.setNumber,
    weight: validated.weight,
    reps: validated.reps,
  });

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);

  return { setId: set.id };
}

// Update set
const UpdateSetSchema = z.object({
  setId: z.number(),
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Weight must be a valid decimal number")
    .nullable()
    .optional(),
  reps: z.number().int().min(0).nullable().optional(),
  workoutId: z.number(),
});

type UpdateSetInput = z.infer<typeof UpdateSetSchema>;

export async function updateSetAction(input: UpdateSetInput) {
  const validated = UpdateSetSchema.parse(input);

  await updateSet(validated.setId, {
    weight: validated.weight,
    reps: validated.reps,
  });

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);

  return { success: true };
}

// Delete set
const DeleteSetSchema = z.object({
  setId: z.number(),
  workoutId: z.number(),
});

type DeleteSetInput = z.infer<typeof DeleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput) {
  const validated = DeleteSetSchema.parse(input);

  await deleteSet(validated.setId);

  revalidatePath(`/dashboard/workout/${validated.workoutId}`);

  return { success: true };
}
