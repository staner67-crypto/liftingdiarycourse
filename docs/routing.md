# Routing Standards

This document outlines the **mandatory** routing patterns for this application. These rules are non-negotiable and must be followed strictly.

## Route Structure

All application routes must be accessed via `/dashboard`. The root `/` page is the only public page.

### Rules

1. **ALL authenticated routes must be under `/dashboard`**
2. **The `/dashboard` route and all sub-routes are protected** - only accessible by logged-in users
3. **Route protection is handled via Next.js middleware** - not at the page level
4. **DO NOT create authenticated routes outside of `/dashboard`**

---

## Route Hierarchy

```
/                           # Public landing page
/sign-in                    # Clerk sign-in page (public)
/sign-up                    # Clerk sign-up page (public)
/dashboard                  # Protected: Main dashboard
/dashboard/workout/new      # Protected: Create new workout
/dashboard/workout/[id]     # Protected: View/edit workout
/dashboard/...              # Protected: All other dashboard routes
```

---

## Middleware Configuration

Route protection **MUST** be configured in the Next.js middleware using Clerk:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Key Points

- `isPublicRoute` defines which routes are accessible without authentication
- `auth.protect()` redirects unauthenticated users to the sign-in page
- All routes not listed in `isPublicRoute` require authentication

---

## Creating New Routes

### Protected Routes (Under /dashboard)

When creating a new authenticated route:

```typescript
// ✅ CORRECT: Route under /dashboard
// app/dashboard/settings/page.tsx
export default async function SettingsPage() {
  // No auth check needed - middleware handles it
  return <Settings />;
}

// ✅ CORRECT: Dynamic route under /dashboard
// app/dashboard/workout/[workoutId]/page.tsx
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  return <Workout id={workoutId} />;
}

// ❌ WRONG: Protected route outside /dashboard
// app/settings/page.tsx
// DO NOT create authenticated routes here
```

### Public Routes

Public routes should be minimal:

```typescript
// ✅ CORRECT: Public landing page
// app/page.tsx
export default function HomePage() {
  return <Landing />;
}

// ❌ WRONG: Creating public routes with sensitive data
// app/workouts/page.tsx
// DO NOT expose authenticated data on public routes
```

---

## Route Parameters

### Dynamic Routes

Use Next.js 15+ async params pattern:

```typescript
// app/dashboard/workout/[workoutId]/page.tsx
type PageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;

  // Fetch data using the workoutId
  const workout = await getWorkout(workoutId);

  return <WorkoutDetails workout={workout} />;
}
```

### Search Params

```typescript
// app/dashboard/page.tsx
type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;

  const workouts = await getWorkouts({ filter });

  return <WorkoutList workouts={workouts} />;
}
```

---

## Navigation

### Internal Navigation

Use Next.js `Link` component for client-side navigation:

```typescript
import Link from "next/link";

// ✅ CORRECT: Using Link for navigation
function WorkoutCard({ id }: { id: string }) {
  return (
    <Link href={`/dashboard/workout/${id}`}>
      View Workout
    </Link>
  );
}

// ✅ CORRECT: Navigation to dashboard
function Header() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard/workout/new">New Workout</Link>
    </nav>
  );
}
```

### Programmatic Navigation

Use `redirect()` for server-side redirects:

```typescript
import { redirect } from "next/navigation";

// ✅ CORRECT: Server-side redirect after action
export async function createWorkout(formData: FormData) {
  "use server";

  const workout = await db.insert(workouts).values({ ... }).returning();

  redirect(`/dashboard/workout/${workout[0].id}`);
}
```

Use `useRouter` for client-side navigation:

```typescript
"use client";

import { useRouter } from "next/navigation";

function CancelButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/dashboard")}>
      Cancel
    </button>
  );
}
```

---

## API Routes

API routes should also be protected:

```typescript
// app/api/workouts/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle authenticated request
}
```

---

## Summary

| Requirement | Status |
|-------------|--------|
| All authenticated routes under `/dashboard` | **MANDATORY** |
| Route protection via middleware | **MANDATORY** |
| Use `createRouteMatcher` for public routes | **MANDATORY** |
| Use `auth.protect()` for protected routes | **MANDATORY** |
| No auth checks in protected pages | **RECOMMENDED** |
| Use Next.js `Link` for navigation | **MANDATORY** |
| Use `redirect()` for server-side redirects | **MANDATORY** |
