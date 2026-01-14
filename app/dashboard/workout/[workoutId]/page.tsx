import { notFound } from "next/navigation";
import { getWorkoutWithExercises } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { WorkoutDetailView } from "./workout-detail-view";

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { workoutId } = await params;

  // Fetch workout with exercises and available exercises in parallel
  const [workoutData, availableExercises] = await Promise.all([
    getWorkoutWithExercises(Number(workoutId)),
    getAllExercises(),
  ]);

  if (!workoutData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WorkoutDetailView
        workout={workoutData.workout}
        exercises={workoutData.exercises}
        availableExercises={availableExercises}
      />
    </div>
  );
}
