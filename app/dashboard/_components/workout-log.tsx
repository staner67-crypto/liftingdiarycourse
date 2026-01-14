"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkoutWithExercises } from "@/data/workouts";

interface WorkoutLogProps {
  workouts: WorkoutWithExercises[];
  selectedDate: Date;
}

export function WorkoutLog({ workouts, selectedDate }: WorkoutLogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(newDate, "yyyy-MM-dd"));
    router.push(`/dashboard?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Workout Log</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/dashboard/workout/new?date=${format(selectedDate, "yyyy-MM-dd")}`}>
                Log New Workout
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "do MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-4">
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No workouts logged for {format(selectedDate, "do MMM yyyy")}
                </p>
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => (
              <div key={workout.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{workout.name || "Workout"}</CardTitle>
                    {workout.notes && (
                      <CardDescription>{workout.notes}</CardDescription>
                    )}
                  </CardHeader>
                  {workout.exercises.length === 0 && (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        No exercises added yet
                      </p>
                    </CardContent>
                  )}
                </Card>
                {workout.exercises.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        {exercise.name}
                      </CardTitle>
                      <CardDescription>
                        {exercise.sets.length} sets logged
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <span>Set</span>
                        <span>Weight (lbs)</span>
                        <span>Reps</span>
                      </div>
                      {exercise.sets.map((set) => (
                        <div
                          key={set.setNumber}
                          className="grid grid-cols-3 gap-2 py-2 border-t"
                        >
                          <span>{set.setNumber}</span>
                          <span>{set.weight ?? "-"}</span>
                          <span>{set.reps ?? "-"}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
