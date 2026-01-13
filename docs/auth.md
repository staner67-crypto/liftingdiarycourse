# Authentication Standards

This document outlines the **mandatory** authentication patterns for this application. These rules are non-negotiable and must be followed strictly.

## Authentication Provider

This project uses **Clerk** as the exclusive authentication provider.

### Rules

1. **ONLY use Clerk** for all authentication functionality
2. **DO NOT implement custom authentication logic**
3. **DO NOT use other auth providers** (NextAuth, Auth.js, Firebase Auth, etc.)

---

## Server-Side Authentication

### Getting the Current User

Always use Clerk's server-side helpers to get the authenticated user.

```typescript
// ✅ CORRECT: Using Clerk's auth() in Server Components
import { auth } from "@clerk/nextjs/server";

async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user-specific data
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}

// ✅ CORRECT: Using currentUser() for full user object
import { currentUser } from "@clerk/nextjs/server";

async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <Profile user={user} />;
}
```

### Helper Function Pattern

Create a centralized auth helper in `/lib/auth.ts`:

```typescript
// /lib/auth.ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return { id: userId };
}
```

Use this helper in all data fetching functions:

```typescript
// ✅ CORRECT: Using the helper in data functions
import { getCurrentUser } from "@/lib/auth";

export async function getWorkouts() {
  const user = await getCurrentUser();

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, user.id));
}
```

---

## Client-Side Authentication

### Using Clerk Hooks

In Client Components, use Clerk's React hooks:

```typescript
// ✅ CORRECT: Using Clerk hooks in Client Components
"use client";

import { useUser, useAuth } from "@clerk/nextjs";

function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading />;
  }

  return <div>Hello, {user?.firstName}</div>;
}

// ✅ CORRECT: Using useAuth for auth state
function AuthStatus() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return isSignedIn ? <SignOutButton /> : <SignInButton />;
}
```

---

## Clerk Components

Use Clerk's pre-built components for authentication UI:

```typescript
// ✅ CORRECT: Using Clerk components
import {
  SignIn,
  SignUp,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";

// Sign in page
export default function SignInPage() {
  return <SignIn />;
}

// Sign up page
export default function SignUpPage() {
  return <SignUp />;
}

// User menu in header
function Header() {
  return (
    <header>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}

// ❌ WRONG: Building custom sign-in forms
function CustomSignIn() {
  // DO NOT build custom auth forms
  return <form onSubmit={handleLogin}>...</form>;
}
```

---

## Route Protection

### Middleware Configuration

Protect routes using Clerk middleware in `middleware.ts`:

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

### Page-Level Protection

For additional protection in Server Components:

```typescript
// ✅ CORRECT: Protecting a page
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard />;
}
```

---

## Environment Variables

Required Clerk environment variables:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Optional: Custom routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Common Patterns

### Checking Auth State

```typescript
// ✅ CORRECT: Server Component
import { auth } from "@clerk/nextjs/server";

async function ConditionalContent() {
  const { userId } = await auth();

  if (userId) {
    return <AuthenticatedContent />;
  }

  return <PublicContent />;
}

// ✅ CORRECT: Client Component
"use client";

import { useAuth } from "@clerk/nextjs";

function ConditionalContent() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <Loading />;

  return isSignedIn ? <AuthenticatedContent /> : <PublicContent />;
}
```

---

## Summary

| Requirement | Status |
|-------------|--------|
| Use Clerk for all authentication | **MANDATORY** |
| Use `auth()` in Server Components | **MANDATORY** |
| Use Clerk hooks in Client Components | **MANDATORY** |
| Use Clerk pre-built components for auth UI | **MANDATORY** |
| Protect routes via middleware | **MANDATORY** |
| Centralized auth helper in `/lib/auth.ts` | **RECOMMENDED** |
| No custom authentication logic | **MANDATORY** |
