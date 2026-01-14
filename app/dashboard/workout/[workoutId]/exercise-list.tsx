"use client";

import { ExerciseCard } from "./exercise-card";

interface ExerciseListProps {
  workoutId: number;
  exercises: {
    id: number;
    name: string;
    order: number;
    sets: {
      id: number;
      setNumber: number;
      weight: string | null;
      reps: number | null;
    }[];
  }[];
}

export function ExerciseList({ workoutId, exercises }: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No exercises added. Click "Add Exercise" to start logging.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} workoutId={workoutId} exercise={exercise} />
      ))}
    </div>
  );
}
