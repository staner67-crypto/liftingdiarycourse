import { db } from "@/db";
import { exercises, workoutExercises, sets, workouts } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// Get all available exercises (shared library, no user filter needed)
export async function getAllExercises() {
  return db.select().from(exercises).orderBy(exercises.name);
}

// Add exercise to workout
export async function addExerciseToWorkout(data: {
  workoutId: number;
  exerciseId: number;
  order: number;
}) {
  const user = await getCurrentUser();

  // Verify workout belongs to user before adding exercise
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, data.workoutId), eq(workouts.userId, user.id)))
    .limit(1);

  if (!workout) {
    throw new Error("Workout not found");
  }

  // Verify exercise exists
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, data.exerciseId))
    .limit(1);

  if (!exercise) {
    throw new Error(`Exercise with ID ${data.exerciseId} not found`);
  }

  try {
    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values(data)
      .returning();

    return workoutExercise;
  } catch (error) {
    console.error("Failed to add exercise to workout:", error);
    console.error("Data:", data);
    throw error;
  }
}

// Remove exercise from workout
export async function removeExerciseFromWorkout(workoutExerciseId: number) {
  const user = await getCurrentUser();

  // Verify ownership through workout join
  const userWorkoutIds = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.userId, user.id));

  await db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        inArray(workoutExercises.workoutId, userWorkoutIds)
      )
    );
}

// Create a set
export async function createSet(data: {
  workoutExerciseId: number;
  setNumber: number;
  weight: string | null;
  reps: number | null;
}) {
  const user = await getCurrentUser();

  // Verify ownership through joins
  const userWorkoutIds = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.userId, user.id));

  const userWorkoutExerciseIds = db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(inArray(workoutExercises.workoutId, userWorkoutIds));

  // Verify the workoutExercise belongs to the user
  const [workoutExercise] = await db
    .select()
    .from(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, data.workoutExerciseId),
        inArray(workoutExercises.id, userWorkoutExerciseIds)
      )
    )
    .limit(1);

  if (!workoutExercise) {
    throw new Error("Workout exercise not found");
  }

  const [set] = await db.insert(sets).values(data).returning();

  return set;
}

// Update a set
export async function updateSet(
  setId: number,
  data: { weight?: string | null; reps?: number | null }
) {
  const user = await getCurrentUser();

  // Verify ownership through joins
  const userWorkoutIds = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.userId, user.id));

  const userWorkoutExerciseIds = db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(inArray(workoutExercises.workoutId, userWorkoutIds));

  const [updated] = await db
    .update(sets)
    .set(data)
    .where(
      and(
        eq(sets.id, setId),
        inArray(sets.workoutExerciseId, userWorkoutExerciseIds)
      )
    )
    .returning();

  return updated;
}

// Delete a set
export async function deleteSet(setId: number) {
  const user = await getCurrentUser();

  // Verify ownership through joins
  const userWorkoutIds = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.userId, user.id));

  const userWorkoutExerciseIds = db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(inArray(workoutExercises.workoutId, userWorkoutIds));

  await db
    .delete(sets)
    .where(
      and(eq(sets.id, setId), inArray(sets.workoutExerciseId, userWorkoutExerciseIds))
    );
}
