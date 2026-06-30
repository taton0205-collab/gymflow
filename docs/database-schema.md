# GymFlow Database Schema

This schema targets Supabase PostgreSQL. All tenant-owned records include `gym_id`.

## Main Tables

- `gyms`: workspace profile, logo, address, socials, timezone, tax settings.
- `profiles`: Supabase user profile and default role metadata.
- `gym_memberships`: user-to-gym role assignments.
- `plans`: membership plans with price, duration, benefits, active state.
- `members`: gym customers, personal data, status, goals, injuries, observations.
- `member_photos`: current and historical member images.
- `payments`: payment ledger, amount, method, state, due date, receipt metadata.
- `attendance_logs`: QR/manual check-ins and check-outs.
- `routines`: trainer-authored routines assigned to clients.
- `routine_exercises`: ordered exercises with sets, reps, weight, rest, media.
- `progress_entries`: body metrics, measurements, notes.
- `progress_photos`: progress media linked to entries.
- `inventory_items`: stock, category, minimum stock, sale price, cost.
- `inventory_movements`: purchases, sales, adjustments.
- `notifications`: generated reminders and delivery state.
- `audit_logs`: sensitive business events.

## Index Strategy

- `gym_id` on every tenant-owned table.
- `(gym_id, status)` for members, payments, inventory.
- `(gym_id, due_date)` for payments and membership expiration.
- `(gym_id, checked_in_at)` for attendance reports.
- `(gym_id, created_at)` for dashboards and audit history.

## RLS Strategy

Each table should enable RLS. Policies should verify that `auth.uid()` has an active row in `gym_memberships` for the target `gym_id`, and that the role has the required capability.

Clients should only access their own `members`, `routines`, `payments`, attendance, and progress rows.
