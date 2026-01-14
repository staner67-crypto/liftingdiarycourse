import "dotenv/config";
import { db } from "@/db";
import { exercises } from "@/db/schema";

async function listExercises() {
  console.log("Listing all exercises in the database...\n");

  try {
    const allExercises = await db.select().from(exercises);

    if (allExercises.length === 0) {
      console.log("No exercises found in the database.");
      return;
    }

    console.log(`Found ${allExercises.length} exercises:\n`);
    allExercises.forEach((exercise) => {
      console.log(`ID: ${exercise.id} - ${exercise.name}`);
    });
  } catch (error) {
    console.error("Error listing exercises:", error);
    throw error;
  }
}

listExercises()
  .then(() => {
    console.log("\nList completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("List failed:", error);
    process.exit(1);
  });
