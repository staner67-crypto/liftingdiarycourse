import { Suspense } from "react";
import { format } from "date-fns";
import { getWorkoutsByDate } from "@/data/workouts";
import { WorkoutLog } from "./_components/workout-log";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { date } = await searchParams;
  const selectedDate = date ? new Date(date) : new Date();
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const workouts = await getWorkoutsByDate(dateString);

  return (
    <Suspense>
      <WorkoutLog workouts={workouts} selectedDate={selectedDate} />
    </Suspense>
  );
}
