# Data Mutation Standards

This document outlines the **mandatory** data mutation patterns for this application. These rules are non-negotiable and must be followed strictly.

## Server Actions Only

**ALL data mutations MUST be done via Server Actions.**

### Structure

Server Actions MUST be colocated with the page or component that uses them in a file named `actions.ts`.

```
app/
  dashboard/
    page.tsx
    actions.ts     # Server actions for dashboard mutations
  workouts/
    [id]/
      page.tsx
      actions.ts   # Server actions for workout detail mutations
    new/
      page.tsx
      actions.ts   # Server actions for creating workouts
```

### Requirements

1. **All server action files must start with `"use server";`**
2. **All server action parameters must be explicitly typed**
3. **FormData is NOT allowed as a parameter type**
4. **All arguments must be validated using Zod**
5. **DO NOT use `redirect()` inside server actions** - Redirects must be handled client-side after the server action resolves

```tsx
// ✅ CORRECT: app/workouts/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(input);

  await createWorkout(validated);
  revalidatePath("/workouts");
}

// ❌ WRONG: Using FormData
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get("name"); // NEVER DO THIS
}

// ❌ WRONG: No Zod validation
export async function createWorkoutAction(input: CreateWorkoutInput) {
  await createWorkout(input); // DANGER: Input not validated
}

// ❌ WRONG: Untyped parameters
export async function createWorkoutAction(input: any) {
  // NEVER use 'any' type
}
```

## Database Mutation Functions

All database mutations MUST be implemented as helper functions within the `/data` directory. These functions wrap Drizzle ORM calls.

### Structure

```
/data
  /workouts.ts    # Workout queries AND mutations
  /exercises.ts   # Exercise queries AND mutations
  /sets.ts        # Set queries AND mutations
  /users.ts       # User queries AND mutations
```

### Requirements

1. **Use Drizzle ORM exclusively** - DO NOT use raw SQL queries
2. **All functions must be async**
3. **All mutations must filter by the authenticated user's ID**
4. **Mutation functions should be named with action verbs** (create, update, delete)

```tsx
// ✅ CORRECT: Using Drizzle ORM in /data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function createWorkout(data: {
  name: string;
  date: string;
  notes?: string;
}) {
  const user = await getCurrentUser();

  return db.insert(workouts).values({
    ...data,
    userId: user.id,
  });
}

export async function updateWorkout(
  workoutId: string,
  data: { name?: string; notes?: string }
) {
  const user = await getCurrentUser();

  return db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id) // CRITICAL: Always filter by user
      )
    );
}

export async function deleteWorkout(workoutId: string) {
  const user = await getCurrentUser();

  return db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id) // CRITICAL: Always filter by user
      )
    );
}

// ❌ WRONG: Raw SQL
export async function createWorkout(data: any) {
  return db.execute(sql`INSERT INTO workouts...`); // NEVER DO THIS
}

// ❌ WRONG: Missing user filter - SECURITY VULNERABILITY
export async function deleteWorkout(workoutId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId)); // DANGER: Any user can delete any workout
}
```

## Zod Validation Patterns

### Basic Validation

```tsx
"use server";

import { z } from "zod";

const UpdateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const validated = UpdateWorkoutSchema.parse(input);
  // Use validated data...
}
```

### Handling Validation Errors

```tsx
"use server";

import { z } from "zod";

const CreateExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  workoutId: z.string().uuid("Invalid workout ID"),
});

type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;

export async function createExerciseAction(input: CreateExerciseInput) {
  const result = CreateExerciseSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await createExercise(result.data);

  return { success: true };
}
```

### Common Zod Schemas

```tsx
// Reusable schema definitions
const idSchema = z.string().uuid();

const dateSchema = z.string().datetime();

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
```

## User Data Isolation (CRITICAL)

**A logged-in user can ONLY mutate their own data. This is a security requirement.**

### Mandatory Rules

1. **EVERY database mutation MUST include a user ID filter**
2. **NEVER trust user-provided IDs without verifying ownership**
3. **ALWAYS get the user ID from the authenticated session, not from request parameters**

```tsx
// ✅ CORRECT: Always verify ownership in data helper
export async function updateWorkout(
  workoutId: string,
  data: { name?: string }
) {
  const user = await getCurrentUser();

  // This query will affect nothing if the workout belongs to another user
  return db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id) // CRITICAL: Always include this
      )
    );
}

// ❌ WRONG: Trusting user-provided userId
export async function updateWorkout(
  workoutId: string,
  userId: string, // DANGER: User could pass another user's ID
  data: { name?: string }
) {
  return db
    .update(workouts)
    .set(data)
    .where(
      and(eq(workouts.id, workoutId), eq(workouts.userId, userId))
    );
}
```

## Complete Example

Here's a complete example showing the proper pattern:

### Data Helper: `/data/workouts.ts`

```tsx
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function createWorkout(data: {
  name: string;
  date: string;
  notes?: string;
}) {
  const user = await getCurrentUser();

  const [workout] = await db
    .insert(workouts)
    .values({
      ...data,
      userId: user.id,
    })
    .returning();

  return workout;
}
```

### Server Action: `app/workouts/new/actions.ts`

```tsx
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(100),
  date: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(input);

  const workout = await createWorkout(validated);

  revalidatePath("/workouts");

  return { workoutId: workout.id };
}

// ❌ WRONG: Using redirect() in server action
export async function createWorkoutAction(input: CreateWorkoutInput) {
  const workout = await createWorkout(input);
  redirect(`/workouts/${workout.id}`); // NEVER DO THIS
}
```

### Client Component: `app/workouts/new/workout-form.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function WorkoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleSubmit() {
    const result = await createWorkoutAction({
      name,
      date: new Date().toISOString(),
    });

    // ✅ CORRECT: Redirect client-side after server action resolves
    router.push(`/workouts/${result.workoutId}`);
  }

  return (
    <form action={handleSubmit}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Button type="submit">Create Workout</Button>
    </form>
  );
}
```

## Summary

| Requirement | Status |
|-------------|--------|
| Mutations via Server Actions only | **MANDATORY** |
| Server Actions in colocated `actions.ts` files | **MANDATORY** |
| Typed parameters (no FormData) | **MANDATORY** |
| Zod validation for all inputs | **MANDATORY** |
| No `redirect()` in server actions (redirect client-side) | **MANDATORY** |
| Database mutations in `/data` directory | **MANDATORY** |
| Use Drizzle ORM (no raw SQL) | **MANDATORY** |
| Filter all mutations by authenticated user ID | **MANDATORY** |
