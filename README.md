# GymFlow

GymFlow is a premium SaaS foundation for managing small and medium gyms.

## What is included

- Next.js App Router structure with TypeScript.
- TailwindCSS design system with light and dark mode.
- Product shell with responsive navigation.
- First dashboard module with metrics, charts, due dates, birthdays, notifications, and AI advisor cards.
- Initial pages for members, plans, payments, QR access, routines, progress, inventory, reports, advisor, and settings.
- Supabase PostgreSQL migration with core commercial entities.
- Architecture, database, and roadmap documentation in `docs/`.

## Local setup

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set your Supabase values before enabling live auth/data.

## Instant preview without installing Node

Open `preview.html` directly in your browser. It is a self-contained prototype for reviewing the product direction, navigation, dashboard, and dark mode before showing the app.

## Important files

- `docs/architecture.md`: product architecture and flows.
- `docs/database-schema.md`: data model and RLS strategy.
- `docs/roadmap.md`: phased delivery plan.
- `supabase/migrations/0001_initial_schema.sql`: initial database schema.
- `app/page.tsx`: dashboard entry point.
- `components/product-shell.tsx`: SaaS navigation and layout.
