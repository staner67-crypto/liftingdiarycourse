import "dotenv/config";
import { db } from "@/db";
import { workouts, exercises, workoutExercises } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testInsert() {
  try {
    // Get a workout
    console.log("Fetching first workout...");
    const [workout] = await db.select().from(workouts).limit(1);
    console.log("Workout:", workout);

    if (!workout) {
      console.log("No workouts found. Please create a workout first.");
      return;
    }

    // Get an exercise
    console.log("\nFetching first exercise...");
    const [exercise] = await db.select().from(exercises).limit(1);
    console.log("Exercise:", exercise);

    if (!exercise) {
      console.log("No exercises found. Please run seed:exercises first.");
      return;
    }

    // Try to insert workout exercise
    console.log("\nAttempting to insert workout exercise...");
    const insertData = {
      workoutId: workout.id,
      exerciseId: exercise.id,
      order: 0,
    };
    console.log("Insert data:", insertData);

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values(insertData)
      .returning();

    console.log("\nSuccess! Inserted:", workoutExercise);
  } catch (error) {
    console.error("\nError during insert:");
    console.error(error);
  }
}

testInsert()
  .then(() => {
    console.log("\nTest completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
