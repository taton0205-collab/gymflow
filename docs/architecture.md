# GymFlow Architecture

GymFlow is a multi-tenant SaaS for small and medium gyms. The product is designed around four roles: `admin`, `employee`, `trainer`, and `client`.

## Product Principles

- Fast operational workflows before decorative marketing.
- Clear permissions per role and per gym.
- Every critical entity is auditable: members, payments, access logs, inventory, and settings.
- AI insights are advisory and derived from trusted business data.
- The UI should feel quiet, premium, and dense enough for daily work.

## Stack

- Frontend: Next.js App Router, React, TypeScript, TailwindCSS, shadcn-style primitives, Framer Motion.
- Backend: Supabase Auth, PostgreSQL, Row Level Security, Supabase Storage.
- Deployment: Vercel for the app, Supabase for database/auth/storage.
- Reports: server-generated PDF and CSV/XLSX exports.
- Future integrations: Mercado Pago, WhatsApp Business API, email provider, background jobs.

## Application Layers

- `app/`: route groups, layouts, metadata, server actions, loading and error states.
- `features/`: business modules such as members, payments, access, routines, reports, inventory.
- `components/`: reusable design primitives and product shell.
- `lib/`: cross-cutting utilities, Supabase clients, permissions, formatting, mock data.
- `supabase/`: migrations, seed data, RLS policies, SQL functions.

## Route Map

- `/`: authenticated product dashboard preview.
- `/dashboard`: metrics, revenue charts, attendance, alerts, AI insights.
- `/members`: member CRM, profile, membership state, payments, attendance.
- `/plans`: plan catalog, pricing, duration, benefits.
- `/payments`: payment ledger, receipts, due dates.
- `/access`: QR scan, quick check-in, entry/exit history.
- `/routines`: trainer routine builder and client routine view.
- `/progress`: measurements, body metrics, progress photos.
- `/inventory`: stock, sales, alerts.
- `/reports`: revenue, retention, attendance, exports.
- `/settings`: gym profile, branding, payment methods, taxes.

## Permission Model

- `admin`: full access to gym data, billing, settings, reports, AI insights.
- `employee`: members, payments, access, limited reports.
- `trainer`: assigned clients, routines, progress notes, attendance visibility.
- `client`: own plan, routine, payments, attendance, progress.

Permissions are enforced twice: UI affordances hide unavailable actions, while database RLS and server checks enforce the real boundary.

## Core Flows

1. Admin creates a gym workspace and configures branding, plans, payment methods, schedules, and staff.
2. Staff registers members, uploads a photo, assigns a plan, and records the first payment.
3. Member receives a QR code for check-in.
4. Access desk scans QR, validates membership state, and logs attendance.
5. Trainer assigns routines and tracks progress.
6. Admin reviews dashboards, reports, due dates, stock, and AI recommendations.

## AI Assistant

The assistant should never invent facts. It reads aggregated metrics from database views such as revenue by plan, attendance by hour, expiring memberships, churn, birthdays, and stock risks. Initial implementation can use deterministic insights; later versions can send summaries to an LLM with strict JSON schema output.

## Production Concerns

- RLS on all tenant-owned tables.
- Database indexes on foreign keys, status fields, due dates, and reporting dates.
- Supabase Storage buckets for member photos, progress photos, exercise media, receipts, and gym logos.
- Structured audit logs for sensitive changes.
- Scheduled jobs for due reminders, birthdays, backup checks, and report snapshots.
