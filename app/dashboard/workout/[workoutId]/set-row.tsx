"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { updateSetAction, deleteSetAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface SetRowProps {
  workoutId: number;
  set: {
    id: number;
    setNumber: number;
    weight: string | null;
    reps: number | null;
  };
}

export function SetRow({ workoutId, set }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");

  // Debounced auto-save
  const debouncedWeight = useDebounce(weight, 500);
  const debouncedReps = useDebounce(reps, 500);

  useEffect(() => {
    const hasChanges =
      debouncedWeight !== (set.weight ?? "") ||
      debouncedReps !== (set.reps?.toString() ?? "");

    if (hasChanges) {
      updateSetAction({
        setId: set.id,
        weight: debouncedWeight || null,
        reps: debouncedReps ? Number(debouncedReps) : null,
        workoutId,
      });
    }
  }, [debouncedWeight, debouncedReps, set.id, set.weight, set.reps, workoutId]);

  const handleDelete = async () => {
    await deleteSetAction({ setId: set.id, workoutId });
  };

  return (
    <div className="grid grid-cols-4 gap-2 py-2 border-t">
      <span className="flex items-center">{set.setNumber}</span>
      <Input
        type="number"
        step="0.01"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="0"
      />
      <Input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        placeholder="0"
      />
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
