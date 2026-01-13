# Data Fetching Standards

This document outlines the **mandatory** data fetching patterns for this application. These rules are non-negotiable and must be followed strictly.

## Server Components Only

**ALL data fetching MUST be done via Server Components.**

### Allowed
- Fetching data directly in Server Components using async/await
- Passing fetched data as props to Client Components

### NOT Allowed
- Route Handlers (API routes) for data fetching
- Client-side data fetching (useEffect, SWR, React Query, fetch in client components)
- Server Actions for data fetching (use them only for mutations)
- Any other data fetching pattern

```tsx
// ✅ CORRECT: Fetch data in a Server Component
async function DashboardPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}

// ❌ WRONG: Fetching via Route Handler
// app/api/workouts/route.ts - DO NOT CREATE THESE FOR DATA FETCHING

// ❌ WRONG: Client-side fetching
"use client";
function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(...); // NEVER DO THIS
  }, []);
}
```

## Database Query Functions

All database queries MUST be implemented as helper functions within the `/data` directory.

### Structure
```
/data
  /workouts.ts    # Workout-related queries
  /exercises.ts   # Exercise-related queries
  /sets.ts        # Set-related queries
  /users.ts       # User-related queries
```

### Requirements

1. **Use Drizzle ORM exclusively** - DO NOT use raw SQL queries
2. **All functions must be async**
3. **All functions must filter by the authenticated user's ID**

```tsx
// ✅ CORRECT: Using Drizzle ORM in /data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getWorkouts() {
  const user = await getCurrentUser();

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, user.id));
}

export async function getWorkoutById(workoutId: string) {
  const user = await getCurrentUser();

  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id) // ALWAYS filter by user
      )
    );

  return workout;
}

// ❌ WRONG: Raw SQL
export async function getWorkouts() {
  return db.execute(sql`SELECT * FROM workouts`); // NEVER DO THIS
}
```

## User Data Isolation (CRITICAL)

**A logged-in user can ONLY access their own data. This is a security requirement.**

### Mandatory Rules

1. **EVERY database query MUST include a user ID filter**
2. **NEVER trust user-provided IDs without verifying ownership**
3. **ALWAYS get the user ID from the authenticated session, not from request parameters**

```tsx
// ✅ CORRECT: Always verify ownership
export async function getWorkoutById(workoutId: string) {
  const user = await getCurrentUser();

  // This query will return nothing if the workout belongs to another user
  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id) // CRITICAL: Always include this
      )
    );

  return workout;
}

// ❌ WRONG: Missing user filter - SECURITY VULNERABILITY
export async function getWorkoutById(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId)); // DANGER: Any user can access any workout

  return workout;
}

// ❌ WRONG: Trusting user-provided userId
export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId)); // DANGER: User could pass another user's ID
}
```

## Summary

| Requirement | Status |
|-------------|--------|
| Data fetching in Server Components only | **MANDATORY** |
| No Route Handlers for fetching | **MANDATORY** |
| No client-side fetching | **MANDATORY** |
| Database queries in `/data` directory | **MANDATORY** |
| Use Drizzle ORM (no raw SQL) | **MANDATORY** |
| Filter all queries by authenticated user ID | **MANDATORY** |
