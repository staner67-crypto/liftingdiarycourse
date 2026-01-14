import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { WorkoutForm } from "./workout-form";

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(Number(workoutId));

  if (!workout) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WorkoutForm workout={workout} />
    </div>
  );
}
