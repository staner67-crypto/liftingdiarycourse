"use client";

import { useState } from "react";
import { WorkoutMetadataForm } from "./workout-metadata-form";
import { ExerciseList } from "./exercise-list";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkoutDetailViewProps {
  workout: {
    id: number;
    name: string | null;
    date: string;
    notes: string | null;
  };
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
  availableExercises: { id: number; name: string }[];
}

export function WorkoutDetailView({
  workout,
  exercises,
  availableExercises,
}: WorkoutDetailViewProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <WorkoutMetadataForm workout={workout} />

      {/* Exercises Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercises</CardTitle>
            <Button onClick={() => setShowAddExercise(true)}>Add Exercise</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ExerciseList workoutId={workout.id} exercises={exercises} />
        </CardContent>
      </Card>

      <AddExerciseDialog
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        workoutId={workout.id}
        availableExercises={availableExercises}
        currentExerciseCount={exercises.length}
      />
    </div>
  );
}
