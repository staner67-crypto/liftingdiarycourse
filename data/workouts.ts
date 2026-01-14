import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getWorkoutsByDate(date: string) {
  const user = await getCurrentUser();

  const result = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, user.id), eq(workouts.date, date)))
    .orderBy(workoutExercises.order, sets.setNumber);

  // Transform flat results into nested structure
  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      date: string;
      notes: string | null;
      exercises: Map<
        number,
        {
          id: number;
          name: string;
          sets: { setNumber: number; weight: string | null; reps: number | null }[];
        }
      >;
    }
  >();

  for (const row of result) {
    if (!row.workout) continue;

    if (!workoutMap.has(row.workout.id)) {
      workoutMap.set(row.workout.id, {
        id: row.workout.id,
        name: row.workout.name,
        date: row.workout.date,
        notes: row.workout.notes,
        exercises: new Map(),
      });
    }

    const workout = workoutMap.get(row.workout.id)!;

    if (row.workoutExercise && row.exercise) {
      if (!workout.exercises.has(row.workoutExercise.id)) {
        workout.exercises.set(row.workoutExercise.id, {
          id: row.workoutExercise.id,
          name: row.exercise.name,
          sets: [],
        });
      }

      const exercise = workout.exercises.get(row.workoutExercise.id)!;

      if (row.set) {
        exercise.sets.push({
          setNumber: row.set.setNumber,
          weight: row.set.weight,
          reps: row.set.reps,
        });
      }
    }
  }

  // Convert Maps to arrays for the final result
  return Array.from(workoutMap.values()).map((workout) => ({
    ...workout,
    exercises: Array.from(workout.exercises.values()),
  }));
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsByDate>
>[number];

export async function createWorkout(data: {
  name?: string;
  date: string;
  notes?: string;
}) {
  const user = await getCurrentUser();

  const [workout] = await db
    .insert(workouts)
    .values({
      ...data,
      userId: user.id,
    })
    .returning();

  return workout;
}

export async function getWorkoutById(workoutId: number) {
  const user = await getCurrentUser();

  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id)
      )
    );

  return workout;
}

export async function updateWorkout(
  workoutId: number,
  data: { name?: string | null; date?: string; notes?: string | null }
) {
  const user = await getCurrentUser();

  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id)
      )
    )
    .returning();

  return workout;
}
