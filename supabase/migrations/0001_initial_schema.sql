create extension if not exists pgcrypto;

create type public.gym_role as enum ('admin', 'employee', 'trainer', 'client');
create type public.member_status as enum ('active', 'expired', 'paused', 'inactive');
create type public.payment_status as enum ('pending', 'partial', 'paid', 'overdue', 'void');
create type public.payment_method as enum ('cash', 'transfer', 'card', 'mercado_pago');

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  address text,
  phone text,
  email text,
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.gym_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (gym_id, user_id)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  duration_days integer not null check (duration_days > 0),
  description text,
  benefits text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  profile_user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  dni text,
  phone text,
  email text,
  birth_date date,
  joined_at date not null default current_date,
  status public.member_status not null default 'active',
  qr_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  observations text,
  injuries text,
  goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_photos (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  photo_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0),
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  due_date date not null,
  next_due_date date,
  receipt_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  source text not null default 'qr',
  created_by uuid references public.profiles(id) on delete set null
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  trainer_id uuid references public.profiles(id) on delete set null,
  name text not null,
  objective text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  name text not null,
  exercise_order integer not null default 0,
  sets integer,
  reps text,
  weight text,
  rest_seconds integer,
  notes text,
  media_url text
);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  weight_kg numeric(6,2),
  body_fat_percent numeric(5,2),
  muscle_mass_kg numeric(6,2),
  measurements jsonb not null default '{}',
  notes text,
  measured_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  progress_entry_id uuid not null references public.progress_entries(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  category text not null,
  stock integer not null default 0,
  minimum_stock integer not null default 0,
  cost numeric(12,2),
  sale_price numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  movement_type text not null check (movement_type in ('purchase', 'sale', 'adjustment')),
  quantity integer not null,
  unit_price numeric(12,2),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  channel text not null,
  title text not null,
  body text not null,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_members_gym_status on public.members (gym_id, status);
create index idx_payments_gym_due_date on public.payments (gym_id, due_date);
create index idx_payments_gym_status on public.payments (gym_id, status);
create index idx_attendance_gym_checked_in on public.attendance_logs (gym_id, checked_in_at);
create index idx_inventory_gym_stock on public.inventory_items (gym_id, stock);
create index idx_audit_logs_gym_created_at on public.audit_logs (gym_id, created_at);

alter table public.gyms enable row level security;
alter table public.profiles enable row level security;
alter table public.gym_memberships enable row level security;
alter table public.plans enable row level security;
alter table public.members enable row level security;
alter table public.member_photos enable row level security;
alter table public.payments enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.progress_entries enable row level security;
alter table public.progress_photos enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
