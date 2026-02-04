# Project Core

## Summary
Build an MVP for AI-powered PTE Core prep that lets users simulate tests, track progress over time, and receive targeted AI feedback on weak areas.

## Core value
Unlike static test sites, the app builds a dynamic user profile from performance data, detecting patterns in mistakes and offering personalized remediation.

## MVP scope
- Test-taking interface for PTE Core sections: Speaking, Writing, Reading, Listening.
- Analytics and progress engine with mistake tags and a weakness heatmap.
- AI tutor that explains wrong answers and provides section-specific tips.

## Primary workflows
- Take a simulated PTE Core test and save answers progressively.
- Analyze the completed test to tag mistakes and update the user profile.
- Ask the AI tutor for contextual feedback on wrong answers.
- Review progress and heatmap insights over time.

## Tech stack
- Framework: Next.js App Router
- Language: TypeScript
- Backend/DB: Convex (functions, real-time data, scheduling)
- UI: shadcn/ui + Tailwind CSS
- AI: Vercel AI SDK (`ai` package) with OpenRouter models
- Auth: Clerk (recommended for user profiles)

## Data model (concepts)
- `users`: identity and aggregate stats (e.g., `averageScore`, `testsTaken`)
- `tests`: static PTE Core question sets
- `submissions`: user answers per test instance
- `analysis`: AI feedback and weakness tags for a submission

## Design guidelines
- Clean, distraction-free UI optimized for test-taking focus.
- Dark/light mode via `next-themes`.
- Desktop-first, mobile-friendly for review.
