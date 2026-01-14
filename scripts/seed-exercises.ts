import "dotenv/config";
import { db } from "@/db";
import { exercises } from "@/db/schema";

const commonExercises = [
  // Chest
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Bench Press",
  "Dumbbell Flyes",
  "Push-ups",
  "Cable Flyes",

  // Back
  "Deadlift",
  "Barbell Row",
  "Dumbbell Row",
  "Pull-ups",
  "Chin-ups",
  "Lat Pulldown",
  "Seated Cable Row",
  "T-Bar Row",

  // Shoulders
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Lateral Raises",
  "Front Raises",
  "Rear Delt Flyes",
  "Face Pulls",
  "Upright Row",

  // Arms
  "Barbell Curl",
  "Dumbbell Curl",
  "Hammer Curl",
  "Preacher Curl",
  "Tricep Pushdown",
  "Overhead Tricep Extension",
  "Skull Crushers",
  "Close-Grip Bench Press",

  // Legs
  "Squat",
  "Front Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Calf Raises",
  "Walking Lunges",
  "Bulgarian Split Squat",

  // Core
  "Plank",
  "Crunches",
  "Russian Twists",
  "Hanging Leg Raises",
  "Cable Crunches",
];

async function seedExercises() {
  console.log("Seeding exercises...");

  try {
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercises);

    if (existingExercises.length > 0) {
      console.log(`Database already has ${existingExercises.length} exercises. Skipping seed.`);
      return;
    }

    // Insert exercises
    for (const exerciseName of commonExercises) {
      await db.insert(exercises).values({ name: exerciseName });
      console.log(`Added: ${exerciseName}`);
    }

    console.log(`Successfully seeded ${commonExercises.length} exercises!`);
  } catch (error) {
    console.error("Error seeding exercises:", error);
    throw error;
  }
}

seedExercises()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
