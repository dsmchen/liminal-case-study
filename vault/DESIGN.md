# Design: Behavior Tracker

**Status:** Draft
**Author:** Doris Chen
**Date:** 22 August 2026

## Summary

A behavior tracker web app based on the ABC (Antecedent-Behavior-Consequence) chart. Designed for SEN (special educational needs) teaching teams to facilitate collaborative data collection and analysis.

## Goals

- **Data capture:** Implement a digital ABC chart capturing data via a responsive web UI.
- **Collaboration:** Enable multi-user data entry, allowing multiple staff members (e.g. lead teachers, teaching assistants, specialist teachers) to log entries for the same student.
- **Insights:** Analyze logged data to identify behavioral triggers (e.g. "writing activity") and make recommendations (e.g. "quiet space to write").

## Non-goals

- **Native mobile apps (iOS/Android):** The web app must be fully responsive/mobile-friendly, separate native apps will not be built in this phase.
- **Parental access:** Access is restricted to the teaching team only in v1.
- **Clinical diagnosis:** The web app provides educational data insights, not medical assessments.
- **Offline mode:** The web app requires an active internet connection.
- **System integration:** No integration with school information systems yet.
- **Formal compliance audit:** This v1 is built with reasonable data-protection practices (access control, encryption) but has not undergone formal legal/compliance review (e.g. GDPR, Hong Kong PDPO). Formal review should occur before wider deployment beyond a single pilot classroom/school.
- **Automated compliance workflows:** The web app does not automatically handle legal data requests (e.g. auto-deleting all data upon "Right to be Forgotten" requests). These processes will be handled manually by admins if required.

## Background

Currently, SEN teaching teams use pen and paper to complete ABC charts ([example](https://www.simplyspecialed.com/wp-content/uploads/2021/03/Screen-Shot-2021-03-06-at-11.13.09-AM-1024x743.jpg)). To start, there is one sheet of paper per student. These sheets of paper are located in the main classroom. This means the ABC chart workflow is manual and not easily accessible by multiple staff members across multiple locations (e.g. main classroom, specialist classroom, hallway). Also, paper entries must be manually collated to spot patterns across observers, which makes analysis slow and error-prone.

Generic digital alternatives (e.g. shared spreadsheets, Google Forms) are sometimes used ad hoc, but lack ABC-specific structure, so entries are inconsistent between staff and hard to analyze systematically.

The strongest purpose-built option is Behavior Trackr, a free [iOS](https://apps.apple.com/us/app/behavior-trackr/id6462937499)/[Android](https://play.google.com/store/apps/details?id=com.radiate.behaviortrackr) app designed specifically for ABC data collection. However, it is not available in the Hong Kong App Store:

> **App Not Available**
>
> This app is currently not available in your country or region.

Paper is physically fixed to one location, spreadsheets and forms lack ABC-specific structure, and the one purpose-built option is not accessible in Hong Kong. As a result, no existing solution lets SEN teaching teams capture ABC data collaboratively across locations and reliably surface patterns from it.

## Proposed design

### Components

- **Web client:** Responsive frontend for logging ABC entries and viewing insights. Used by lead teachers, teaching assistants, and specialist teachers from shared classroom devices or personal laptops/tablets via browser (no native app, per non-goals).
- **API routes:** Handles authentication, entry submission, data retrieval, and triggers insight generation. Same codebase/deployment as the web client (see "Tech stack").
- **Database:** Stores student profiles, staff accounts, and ABC entries, with built-in authentication (see "Tech stack").
- **Insights engine:** Scheduled job that sends accumulated entries to an LLM to surface patterns (e.g. recurring antecedents) once enough data exists, and generate recommendations.

### Tech stack

- **Frontend:** Next.js (React) — handles both the responsive web client and API routes in one codebase, reducing the number of separate services to build and deploy.
- **Backend:** Next.js API routes — avoids standing up a separate API server. Logic for auth, entry submission, and insight generation lives alongside the frontend.
- **Database:** Supabase (managed Postgres) — provides the database, built-in authentication, and row-level access control out of the box, reducing custom auth/security code.
- **AI/insights (MVP):** Gemini API (free tier) — generous free quota suits MVP development. Free-tier prompts may be used for model training, but MVP runs on synthetic/placeholder data only (see "Data seeding"), so this is not a real privacy exposure yet. Must be swapped for a provider with a no-training commercial tier (e.g. Claude API) before any real student data is used.
- **Hosting:** Vercel — pairs naturally with Next.js, one-command deploys, free tier sufficient for a single-classroom pilot.
- **Styling:** Tailwind CSS — fast to build responsive layouts without a separate design system.

This stack was chosen to minimize the number of services a solo developer needs to configure and maintain (one hosting provider, one database/auth provider), at the cost of some vendor lock-in to Vercel/Supabase/the chosen LLM provider specifically.

### Testing strategy

- **Unit tests (Vitest):** Cover business logic that is easy to get subtly wrong and costly to get wrong silently — insights threshold logic, entry validation, de-identification before LLM calls (see "Access control and data protection"). Run against Supabase using a local/test database, never against real student data.
- **E2E tests (Playwright):** Cover the core staff workflows end to end — login, submitting an ABC entry, viewing entry history, and the insights-not-yet-available vs. insights-shown states. Run against seeded synthetic data (see "Data seeding"), consistent with the "no real student data in fixtures" constraint in AGENTS.md.
- Both test suites run in CI before merge (once CI is set up — not yet configured for this solo MVP).

### Data flow

1. A staff member logs in via the web client (teaching-team accounts only, per non-goals).
2. They select a student and submit an ABC entry (Antecedent, Behavior, Consequence, comments, timestamp, location, staff ID).
3. The API routes validate and write the entry to Supabase, tagged with the submitting staff member and timestamp.
4. Entries from all staff accumulate against the same student profile, regardless of who logged them or from where.
5. Once a student has enough entries (see "Insights engine" below), the insights engine analyzes them for repeated patterns and surfaces a recommendation (e.g. "writing activity precedes X in 6 of 8 entries — consider a quiet space during writing").
6. Staff view a student's entry history and any generated insights through the web client.

### Data model

- **Student:** name/ID, active status
- **Staff:** name, role (lead teacher / TA / specialist)
- **Entry:** student ID, staff ID, antecedent, behavior, consequence, comments, timestamp, location
- **Insight:** student ID, pattern description, supporting entry IDs, generated timestamp

### Data seeding

MVP is seeded with placeholder/synthetic data rather than real student records, avoiding real data exposure during initial build and testing.

### Insights engine

Insights ship in v1, gated behind a minimum entry threshold (e.g. a pattern is only surfaced once a student has 5+ logged entries), to avoid recommending based on a single data point. Below that threshold, the UI shows logged entries as normal but no insights yet (e.g. "Not enough data yet — 3/5 entries logged"). Once the threshold is met, a student's entries are sent to an LLM, which returns a plain-language pattern description and a recommendation. The threshold should be a configurable value, not hardcoded, in case it needs adjusting per student population.

### Access control and data protection

- Authentication required for all staff, no anonymous or public access.
- Any authenticated staff member can view and log entries for any student. Access is restricted by team membership (i.e. having a valid staff login), not by per-student assignment.
- Data encrypted in transit (HTTPS) and at rest (database-level encryption).
- The admin role is held by the school's IT team, who can delete a student's full record on request, satisfying the manual deletion process implied by the "Automated compliance workflows" non-goal.
- Entries sent to the LLM provider for insight generation are stripped of student name and staff identity first — only antecedent, behavior, consequence, comments, and timestamp/location are sent, referenced by an internal student ID rather than a name. The LLM provider never receives directly identifying information.

### Diagram

![[Pasted image 20260823062534.png]]

## Alternatives considered

- **Native mobile app instead of responsive web app:** Would require separate iOS/Android codebases (or a cross-platform framework), doubling build and maintenance effort for a v1. A responsive web app covers the "log entries from anywhere in the building" need without that overhead, and staff already have browser access on devices.
- **Per-student staff assignment/roster (restricting access to only assigned staff):** Adds a roster-management feature (assigning staff to students) before the core logging/insights loop even works. Given the small size of a typical SEN teaching team, team-wide access is a reasonable v1 trade-off. Most staff already interact with most students day to day.
- **Real-time insights (recalculating after every single entry):** Meaningful patterns require multiple data points — a real-time recalculation after entry #1 would either show nothing useful or risk surfacing a false pattern too early. A threshold-gated approach (5+ entries) with periodic recalculation gives more reliable output without the engineering cost of true real-time analysis.
- **Using or extending Behavior Trackr instead of building new:** Not available in the Hong Kong App Store (see "Background"), and as a closed third-party product, there is no way to extend or self-host it to work around that restriction.
- **Generic form tool (e.g. Google Forms + Sheets) instead of a purpose-built app:** No structured ABC schema, so data entry is inconsistent between staff (free text vs. structured fields). Pattern analysis would require manual spreadsheet work rather than automated insight generation — the core problem this project is meant to solve.
- **Full compliance certification (e.g. GDPR/PDPO audit) before launch:** A formal audit is a significant investment, better justified once the tool is validated with real usage rather than upfront (see "Formal compliance audit" non-goal).

## Trade-offs

- **Team-wide access, no per-student assignment:** Any authenticated staff member can view and log entries for any student, rather than only staff explicitly assigned to that student. This simplifies the data model and matches how small SEN teaching teams typically work day to day, but means a staff member could view a student's full behavioral history even without a direct working relationship to them. Worth revisiting if the teaching team grows beyond a single classroom, or if a school/district requires more granular access control.
- **Insights threshold delays value for new students:** Gating insights behind a minimum entry count (e.g. 5+) avoids false patterns from too little data, but means a newly enrolled student has no insights for the first few weeks of logging, even if a real pattern would be visible sooner. Accepted as the safer default. The threshold is configurable if this proves too conservative in practice.
- **No offline support:** The web app requires an active internet connection. If connectivity drops mid-entry (a real risk in some school buildings), a staff member risks losing an in-progress entry. Accepted for v1 to avoid the complexity of offline-first sync. At minimum, the client should hold entered data in local state until submission succeeds, so a dropped connection does not silently lose a completed entry.
- **No formal compliance review yet:** The web app is built with baseline data protections (access control, encryption), but has not undergone formal legal/compliance review (e.g. GDPR, Hong Kong PDPO). This is an acceptable risk for a single pilot classroom, but is a hard blocker before wider deployment — this should not be treated as an indefinitely deferred item.
- **AI-generated recommendations, not rule-based pattern matching:** Using an LLM to generate insights is faster to build than a custom statistical pattern-matching system, but recommendations are probabilistic rather than deterministic — the same entries could plausibly generate slightly different phrasing or emphasis on separate runs. Staff should treat insights as a prompt for discussion, not a definitive finding — consistent with the "Clinical diagnosis" non-goal.
- **Gemini free tier for MVP, despite training-use terms:** Using Gemini's free tier is low-risk during MVP development since it only processes synthetic data (see "Data seeding"), but this is not a decision that carries over to real usage. Before any real student data is sent for insight generation, the AI provider must be switched to one with a no-training commercial tier (e.g. Claude API). This switch should happen before the pilot launch, not be discovered as a gap during it.

## Open questions

- **Insights threshold value:** Is 5+ entries the right starting number, or should it vary by student/context? Configurable per earlier decision, but the default value itself is still a guess.
- **Roster/assignment model at scale:** Team-wide access works for a single classroom team. At what point (more staff, multiple schools) does this need to become per-student assignment instead? No trigger point defined yet.
- **Data retention period:** No stated policy on how long entries are kept after a student leaves the school or the pilot ends. Worth deciding before real data is collected, not after.
- **LLM data handling:** Entries are stripped of name/staff identity before being sent to the LLM provider, but an internal student ID may still count as personal/identifiable data under Hong Kong PDPO or the provider's own terms. Needs a check of the specific LLM provider's data retention, training-use, and processing-region policies before this is treated as sufficient de-identification — relevant to the "Formal compliance audit" non-goal.

## Pilot readiness checklist

Before real student data is entered (i.e. before "Data seeding" placeholder data is replaced), confirm:

- **AI provider swapped:** Gemini (MVP/free tier) replaced with a no-training commercial provider (e.g. Claude API), per the "Gemini free tier for MVP" trade-off.
- **Admin role staffed:** School IT team has been identified and given admin access, per "Access control and data protection."
- **Data retention period decided:** A policy exists for how long entries are kept after a student leaves or the pilot ends, per the "Data retention period" open question.
- **LLM data handling confirmed:** De-identification approach (internal student ID, no name) has been checked against the chosen provider's terms and, ideally, Hong Kong PDPO's definition of personal data, per the "LLM data handling" open question.
- **Insights threshold reviewed:** Default entry threshold (5+) confirmed as reasonable for the actual pilot student population, per the "Insights threshold value" open question.

This list should be revisited and updated as new decisions are made. It is not exhaustive on its own, but exists to make sure decisions already flagged elsewhere in this doc do not get lost between drafting and launch.
