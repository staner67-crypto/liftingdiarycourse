# Server Components Standards

This document outlines the **mandatory** server component patterns for this application. These rules are non-negotiable and must be followed strictly.

## Server Components by Default

**ALL pages and layouts MUST be Server Components unless client interactivity is required.**

### Rules

1. **Pages are Server Components by default** - Do not add `"use client"` to page files
2. **Fetch data directly in Server Components** - No API routes or client-side fetching
3. **Pass data as props to Client Components** - Keep Client Components minimal
4. **Never use `"use client"` in page.tsx files** - Extract interactive parts to separate components

---

## Page Structure

### Basic Page Pattern

```tsx
// app/dashboard/page.tsx
// ✅ CORRECT: Server Component page with data fetching
import { getWorkouts } from "@/data/workouts";
import { WorkoutList } from "./_components/workout-list";

export default async function DashboardPage() {
  const workouts = await getWorkouts();

  return <WorkoutList workouts={workouts} />;
}

// ❌ WRONG: Client Component page
"use client";

export default function DashboardPage() {
  // Don't make pages client components
}
```

### Page with Route Parameters

```tsx
// app/dashboard/workout/[workoutId]/page.tsx
// ✅ CORRECT: Async params pattern (Next.js 15+)
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

  return <WorkoutForm workout={workout} />;
}

// ❌ WRONG: Synchronous params (deprecated in Next.js 15+)
export default async function EditWorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const workout = await getWorkoutById(Number(params.workoutId)); // Wrong
}
```

### Page with Search Parameters

```tsx
// app/dashboard/page.tsx
// ✅ CORRECT: Async searchParams pattern (Next.js 15+)
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

  const workouts = await getWorkoutsByDate(selectedDate);

  return <WorkoutLog workouts={workouts} selectedDate={selectedDate} />;
}

// ❌ WRONG: Synchronous searchParams (deprecated in Next.js 15+)
interface DashboardPageProps {
  searchParams: { date?: string }; // Wrong - should be Promise
}
```

---

## Component Organization

### Directory Structure

```
app/
  dashboard/
    page.tsx              # Server Component (data fetching)
    _components/          # Colocated components (underscore prefix)
      workout-log.tsx     # Client Component (interactivity)
      workout-card.tsx    # Can be Server or Client Component
```

### Extracting Client Components

```tsx
// ✅ CORRECT: Server Component page with extracted Client Component
// app/dashboard/page.tsx
import { getWorkouts } from "@/data/workouts";
import { WorkoutList } from "./_components/workout-list";

export default async function DashboardPage() {
  const workouts = await getWorkouts();

  // Data fetched in Server Component, passed to Client Component
  return <WorkoutList workouts={workouts} />;
}

// app/dashboard/_components/workout-list.tsx
"use client";

import { useState } from "react";

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  const [filter, setFilter] = useState("");

  // Client-side interactivity here
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {workouts.filter(...).map(...)}
    </div>
  );
}
```

---

## Data Fetching in Server Components

### Direct Database Queries

```tsx
// ✅ CORRECT: Fetch data using helper functions
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}

// ❌ WRONG: Fetch from API routes
export default async function DashboardPage() {
  const res = await fetch("/api/workouts"); // Never do this
  const workouts = await res.json();
}

// ❌ WRONG: Direct database queries in page
import { db } from "@/db";

export default async function DashboardPage() {
  const workouts = await db.select().from(workouts); // Use data helpers instead
}
```

### Parallel Data Fetching

```tsx
// ✅ CORRECT: Fetch independent data in parallel
export default async function DashboardPage() {
  const [workouts, exercises, stats] = await Promise.all([
    getWorkouts(),
    getExercises(),
    getStats(),
  ]);

  return (
    <Dashboard workouts={workouts} exercises={exercises} stats={stats} />
  );
}

// ❌ WRONG: Sequential fetching when parallel is possible
export default async function DashboardPage() {
  const workouts = await getWorkouts();
  const exercises = await getExercises(); // Waits unnecessarily
  const stats = await getStats(); // Waits unnecessarily
}
```

---

## Error Handling

### Not Found Pattern

```tsx
// ✅ CORRECT: Use notFound() for missing resources
import { notFound } from "next/navigation";

export default async function WorkoutPage({ params }: { params: Params }) {
  const { id } = await params;
  const workout = await getWorkoutById(Number(id));

  if (!workout) {
    notFound(); // Renders not-found.tsx
  }

  return <WorkoutDetails workout={workout} />;
}
```

### Error Boundary

Create `error.tsx` files for error handling:

```tsx
// app/dashboard/error.tsx
"use client"; // Error components must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## Loading States

### Loading UI

Create `loading.tsx` files for Suspense fallbacks:

```tsx
// app/dashboard/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
```

### Streaming with Suspense

```tsx
// ✅ CORRECT: Use Suspense for granular loading states
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<WorkoutsSkeleton />}>
        <WorkoutsSection />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </div>
  );
}

// Each section fetches its own data
async function WorkoutsSection() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

---

## Common Patterns

### Conditional Rendering Based on Auth

```tsx
// ✅ CORRECT: Check auth in Server Component
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

### Passing Server Data to Client Components

```tsx
// ✅ CORRECT: Serialize data properly
export default async function Page() {
  const workout = await getWorkout();

  // Pass plain objects/primitives to Client Components
  return (
    <WorkoutForm
      workout={{
        id: workout.id,
        name: workout.name,
        date: workout.date,
        notes: workout.notes,
      }}
    />
  );
}

// ❌ WRONG: Passing non-serializable data
export default async function Page() {
  const workout = await getWorkout();

  // Functions, Dates, Maps, etc. can't be passed directly
  return <WorkoutForm workout={workout} onSave={saveWorkout} />;
}
```

---

## Summary

| Requirement | Status |
|-------------|--------|
| Pages are Server Components (no `"use client"`) | **MANDATORY** |
| Data fetching in Server Components only | **MANDATORY** |
| Use async `params` and `searchParams` (Next.js 15+) | **MANDATORY** |
| Extract interactive parts to Client Components | **MANDATORY** |
| Use `notFound()` for missing resources | **MANDATORY** |
| Colocate components in `_components` directory | **RECOMMENDED** |
| Use `loading.tsx` for loading states | **RECOMMENDED** |
| Use `error.tsx` for error boundaries | **RECOMMENDED** |
| Parallel data fetching with `Promise.all` | **RECOMMENDED** |
