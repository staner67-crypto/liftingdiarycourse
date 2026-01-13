# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive component library.

### Rules

1. **ONLY use shadcn/ui components** for all UI elements
2. **DO NOT create custom components** - use existing shadcn/ui components or request new ones to be added via `npx shadcn@latest add <component>`
3. If a UI pattern is not available in shadcn/ui, compose existing shadcn/ui components together

### Available Components

Add components as needed using:

```bash
npx shadcn@latest add <component-name>
```

Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for the full list of available components.

---

## Date Formatting

All date formatting must use **date-fns**.

### Format Standard

Dates should be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use the `format` function from date-fns with ordinal day formatting:

```typescript
import { format } from "date-fns";

// Format: "do MMM yyyy"
const formattedDate = format(new Date(), "do MMM yyyy");
// Output: "1st Sep 2025"
```

### Format Tokens

- `do` - Day of month with ordinal (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - Full year (2025)
