<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent instructions: Behavior Tracker

Instructions for AI coding agents working in this repo.

## Project context

This is a behavior tracker web app for SEN (special educational needs) teaching teams, based on the ABC (Antecedent-Behavior-Consequence) chart. Full context, architecture, and rationale live in [`docs/DESIGN.md`](docs/DESIGN.md) — read it before making non-trivial changes. Do not rely on this file alone for architectural decisions.

## Tech stack

- Next.js (React) — frontend and API routes, same codebase
- Supabase — Postgres database, authentication
- Gemini API — MVP-only insights provider (see below)
- Vercel — hosting
- Tailwind CSS — styling

## Critical constraints — do not violate

- **No real student data in code, tests, fixtures, or commits.** This project handles behavioral data on minors with disabilities. All development and test data must be synthetic/placeholder (see "Data seeding" in DESIGN.md). Never generate, hardcode, or suggest real names, real schools, or realistic-but-fabricated student identifiers that could be mistaken for real data.
- **The Gemini API is MVP-only.** Do not treat it as the final AI provider. Any code sending real (non-synthetic) entries to an LLM must use a no-training commercial provider — see the "Gemini free tier for MVP" trade-off and "Pilot readiness checklist" in DESIGN.md. Flag this explicitly if asked to wire up real data before that swap has happened.
- **Entries sent to the LLM must be de-identified first** — no student name, no staff name, only an internal student ID. Do not "simplify" this by passing full records through for convenience.
- **Access control is team-wide by design, not a bug.** Any authenticated staff member can view/log entries for any student in v1 (see "Access control and data protection" in DESIGN.md). Don't add per-student restriction logic without checking DESIGN.md first — this was a deliberate scope decision, not an oversight.
- **No native mobile app, no offline mode, no third-party school-system integrations.** These are explicit non-goals for this phase. Do not add dependencies or scaffolding for these without being asked.
- **Insights are gated behind a minimum entry threshold** (default 5+, configurable — not hardcoded). Do not implement insight generation that fires on every single entry.

## Conventions

- Component and API route naming should match the terms used in DESIGN.md ("API routes," not "API server"; "Supabase," not "the database") — keep code, comments, and docs using the same vocabulary.
- New architectural decisions, trade-offs, or scope changes should be reflected back into `docs/DESIGN.md` (and `vault/DESIGN.md`, its Obsidian source — see the note at the top of `docs/DESIGN.md`), not left undocumented in code comments only.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — tooling, config, dependencies
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests

Scope is optional (e.g. `feat(auth): add login page`). Keep the subject line under 72 characters.

## When in doubt

If a task seems to conflict with something in DESIGN.md's "Non-goals", "Trade-offs", or "Access control" sections, stop and flag the conflict rather than resolving it silently in code.
