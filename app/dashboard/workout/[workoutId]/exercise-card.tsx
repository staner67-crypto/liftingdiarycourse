"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { removeExerciseAction, createSetAction } from "./actions";
import { SetRow } from "./set-row";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExerciseCardProps {
  workoutId: number;
  exercise: {
    id: number;
    name: string;
    order: number;
    sets: {
      id: number;
      setNumber: number;
      weight: string | null;
      reps: number | null;
    }[];
  };
}

export function ExerciseCard({ workoutId, exercise }: ExerciseCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleRemove = async () => {
    if (!confirm(`Remove ${exercise.name}?`)) return;

    await removeExerciseAction({
      workoutExerciseId: exercise.id,
      workoutId,
    });
  };

  const handleAddSet = async () => {
    setIsAdding(true);
    try {
      await createSetAction({
        workoutExerciseId: exercise.id,
        setNumber: exercise.sets.length + 1,
        weight: null,
        reps: null,
        workoutId,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header Row */}
        <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2">
          <span>Set</span>
          <span>Weight (lbs)</span>
          <span>Reps</span>
          <span></span>
        </div>

        {/* Set Rows */}
        {exercise.sets.map((set) => (
          <SetRow key={set.id} workoutId={workoutId} set={set} />
        ))}

        {/* Add Set Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={handleAddSet}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
