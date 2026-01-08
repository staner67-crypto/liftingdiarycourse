# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (starts on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Lint**: `npm run lint`

## Architecture

This is a Next.js 16 project using the App Router pattern with React 19 and TypeScript.

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript (strict mode)

### Project Structure
- `app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page
  - `globals.css` - Global styles and Tailwind imports
- `public/` - Static assets

### Path Aliases
- `@/*` maps to the project root (configured in tsconfig.json)
