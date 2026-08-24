# Behavior Tracker

> **This repo is a case study.** See [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md) for the full write-up on the problem, approach, and impact of using AI to design and build this project.

A web app for logging and analyzing ABC (Antecedent-Behavior-Consequence) charts, built for SEN (special educational needs) teaching teams. Replaces paper-based ABC charting with a collaborative digital tool that multiple staff members can log into and surface behavioral patterns from.

Full reasoning, architecture, and open decisions are documented in [`docs/DESIGN.md`](docs/DESIGN.md).

## Status 

**Draft / MVP in development.** Currently seeded with placeholder data only — see the [Pilot readiness checklist](docs/DESIGN.md#pilot-readiness-checklist) in the design doc before any real student data is entered.

## Project structure

```
├── docs/                     # CASE_STUDY.md, DESIGN.md, and supporting diagram
├── src/
│   ├── app/
│   │   ├── api/              # API routes (insights)
│   │   ├── auth/             # Auth routes (callback, signout)
│   │   ├── entries/          # ABC entry pages (list + new)
│   │   ├── insights/         # Insights page
│   │   ├── students/         # Student management (list, new, detail)
│   │   ├── login/            # Login page
│   │   ├── layout.tsx        # Root layout with header
│   │   └── page.tsx          # Dashboard
│   ├── components/           # Shared components (header, Spinner)
│   ├── lib/
│   │   ├── gemini.ts         # Gemini API client
│   │   ├── insights.ts       # Insights business logic
│   │   ├── supabase/         # Supabase client (server + browser)
│   │   └── types.ts          # TypeScript types + form options
│   ├── proxy.ts              # Auth proxy (session refresh, redirects)
│   └── test/                 # Unit tests
├── e2e/                      # Playwright E2E tests
├── supabase/migrations/      # Database migrations
├── AGENTS.md                 # AI agent instructions
├── README.md                 # You are here
├── playwright.config.ts      # Playwright config
└── vitest.config.mts         # Vitest config
```

## Tech stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth)
- **AI/Insights:** Gemini API (MVP)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Hosting:** Vercel

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials and Gemini API key.

3. Run database migrations in Supabase SQL Editor:
   Run all `.sql` files in `supabase/migrations/` in numerical order.

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Testing

- **Unit tests:** `npm test`
- **E2E tests:** `npx playwright test`
- **E2E tests (with UI):** `npx playwright test --ui`

## Key files

- [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md) — Problem framing, AI-assisted design approach, and impact analysis
- [`docs/DESIGN.md`](docs/DESIGN.md) — Full architecture, rationale, and open decisions
- [`AGENTS.md`](AGENTS.md) — Instructions for AI coding agents
- [`src/lib/types.ts`](src/lib/types.ts) — TypeScript types and ABC form options
- [`src/lib/gemini.ts`](src/lib/gemini.ts) — Gemini API client and prompt
- [`src/lib/insights.ts`](src/lib/insights.ts) — De-identification and threshold logic

## Contributing

This is currently a single-developer MVP. Design decisions, trade-offs, and open questions are tracked in [`docs/DESIGN.md`](docs/DESIGN.md) rather than a separate CONTRIBUTING.md at this stage.
