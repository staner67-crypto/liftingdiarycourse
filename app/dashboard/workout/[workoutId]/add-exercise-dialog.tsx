"use client";

import { useState } from "react";
import { addExerciseAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: number;
  availableExercises: { id: number; name: string }[];
  currentExerciseCount: number;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  workoutId,
  availableExercises,
  currentExerciseCount,
}: AddExerciseDialogProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSelect = async (exerciseId: number) => {
    setIsAdding(true);
    try {
      await addExerciseAction({
        workoutId,
        exerciseId,
        order: currentExerciseCount,
      });
      onOpenChange(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {availableExercises.map((exercise) => (
              <Button
                key={exercise.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelect(exercise.id)}
                disabled={isAdding}
              >
                {exercise.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
