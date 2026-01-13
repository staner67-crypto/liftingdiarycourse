"use client";

import { useState } from "react";
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

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Bench Press",
    sets: [
      { weight: 135, reps: 10 },
      { weight: 155, reps: 8 },
      { weight: 175, reps: 6 },
    ],
  },
  {
    id: "2",
    name: "Squat",
    sets: [
      { weight: 185, reps: 10 },
      { weight: 205, reps: 8 },
      { weight: 225, reps: 6 },
    ],
  },
  {
    id: "3",
    name: "Deadlift",
    sets: [
      { weight: 225, reps: 8 },
      { weight: 275, reps: 6 },
      { weight: 315, reps: 4 },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Workout Log</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "do MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-4">
          {mockWorkouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No workouts logged for {format(date, "do MMM yyyy")}
                </p>
                <Button className="mt-4">Log a Workout</Button>
              </CardContent>
            </Card>
          ) : (
            mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {workout.name}
                  </CardTitle>
                  <CardDescription>
                    {workout.sets.length} sets logged
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <span>Set</span>
                    <span>Weight (lbs)</span>
                    <span>Reps</span>
                  </div>
                  {workout.sets.map((set, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 py-2 border-t"
                    >
                      <span>{index + 1}</span>
                      <span>{set.weight}</span>
                      <span>{set.reps}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
