# Coding Conventions

## General
- Prefer small, composable components.
- Keep files focused; avoid multi-purpose modules.
- Name things by their purpose, not their implementation.

## React/Next.js
- Use Server Components by default; add `"use client"` only when necessary.
- Co-locate component-specific styles and tests.
- Use the App Router patterns (layouts, loading, error boundaries) for page structure.
- Prefer data access via Convex functions instead of client-side fetches when possible.

## TypeScript
- Prefer explicit types for public APIs.
- Avoid `any` unless absolutely required.

## Data and AI
- Convex is the source of truth for test state and submissions.
- Store AI output and tags in `analysis` for reproducibility.
- Use Vercel AI SDK streaming for tutor responses; pass only necessary context.

## UI and UX
- Keep the test-taking UI minimal and focused.
- Use shadcn/ui primitives; avoid one-off UI patterns unless required.
- Support dark/light themes consistently.
