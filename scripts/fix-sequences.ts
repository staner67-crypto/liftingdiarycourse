import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function fixSequences() {
  console.log("Fixing PostgreSQL sequences...\n");

  try {
    // Fix workout_exercises sequence
    console.log("Fixing workout_exercises sequence...");
    await sql`
      SELECT setval(
        pg_get_serial_sequence('workout_exercises', 'id'),
        COALESCE((SELECT MAX(id) FROM workout_exercises), 0) + 1,
        false
      );
    `;
    console.log("✓ workout_exercises sequence fixed");

    // Fix sets sequence
    console.log("Fixing sets sequence...");
    await sql`
      SELECT setval(
        pg_get_serial_sequence('sets', 'id'),
        COALESCE((SELECT MAX(id) FROM sets), 0) + 1,
        false
      );
    `;
    console.log("✓ sets sequence fixed");

    // Fix exercises sequence
    console.log("Fixing exercises sequence...");
    await sql`
      SELECT setval(
        pg_get_serial_sequence('exercises', 'id'),
        COALESCE((SELECT MAX(id) FROM exercises), 0) + 1,
        false
      );
    `;
    console.log("✓ exercises sequence fixed");

    // Fix workouts sequence
    console.log("Fixing workouts sequence...");
    await sql`
      SELECT setval(
        pg_get_serial_sequence('workouts', 'id'),
        COALESCE((SELECT MAX(id) FROM workouts), 0) + 1,
        false
      );
    `;
    console.log("✓ workouts sequence fixed");

    console.log("\n✅ All sequences fixed successfully!");
  } catch (error) {
    console.error("Error fixing sequences:", error);
    throw error;
  }
}

fixSequences()
  .then(() => {
    console.log("\nSequence fix completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Sequence fix failed:", error);
    process.exit(1);
  });
